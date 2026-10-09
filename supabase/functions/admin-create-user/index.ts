// Supabase Edge Function: admin-create-user (V3-A3)
// Permite a superadministradores crear usuarios formales en Supabase Auth
// y asignarles sus roles institucionales mediante la clave service_role.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allowed = [
    "https://citra.com.ar",
    "https://www.citra.com.ar",
    "http://localhost:5173",
    "http://localhost:3000",
  ];
  // V4-B2: Restringir orígenes permitidos evitando comodines genéricos
  const isAllowed = allowed.includes(origin) || /^https:\/\/citra(-[a-z0-9-]+)?\.vercel\.app$/.test(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : (allowed[0] ?? "*"),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Falta cabecera de autorización" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cliente con token del invocador para verificar si es superadmin
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: callerUser }, error: userError } = await userClient.auth.getUser();
    if (userError || !callerUser) {
      return new Response(JSON.stringify({ error: "Usuario no autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Comprobar rol superadmin en profiles
    const { data: profile, error: profileErr } = await userClient
      .from("profiles")
      .select("role, first_name, last_name")
      .eq("id", callerUser.id)
      .single();

    if (profileErr || profile?.role !== "superadmin") {
      return new Response(JSON.stringify({ error: "Acceso denegado: Se requiere rol superadmin" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, password, first_name, last_name, role, doctor_id } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "email y password son requeridos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // V4-B2: Clave mínima homogénea de 12 caracteres
    if (typeof password !== "string" || password.trim().length < 12) {
      return new Response(JSON.stringify({ error: "La contraseña institucional debe contener al menos 12 caracteres" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // V4-M2: Validación estricta de roles institucionales (no asignar 'doctor' por omisión)
    const validRoles = ["superadmin", "doctor", "administrative", "patient"];
    if (role && !validRoles.includes(role)) {
      return new Response(JSON.stringify({ error: `Rol inválido. Debe ser uno de: ${validRoles.join(", ")}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const assignedRole = role || "patient";

    // Cliente admin con clave service_role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Crear usuario en GoTrue
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password.trim(),
      email_confirm: true,
      user_metadata: {
        first_name: first_name || "",
        last_name: last_name || "",
        role: assignedRole,
      },
    });

    if (createError || !created?.user) {
      return new Response(JSON.stringify({ error: createError?.message || "Error al crear usuario" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newUserId = created.user.id;

    // V4-M2: JavaScript nativo email.split("@")[0] en lugar de SQL split_part
    const defaultFirstName = first_name || (email.includes("@") ? email.split("@")[0] : email);

    // Actualizar rol en profiles
    const { error: profileUpsertError } = await adminClient.from("profiles").upsert({
      id: newUserId,
      email: email.trim().toLowerCase(),
      first_name: defaultFirstName,
      last_name: last_name || "",
      role: assignedRole,
      is_active: true,
    });

    if (profileUpsertError) {
      console.error("Error al actualizar perfil:", profileUpsertError);
      await adminClient.auth.admin.deleteUser(newUserId);
      return new Response(JSON.stringify({ error: "Error al actualizar perfil: " + profileUpsertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Si viene doctor_id, vincularlo mediante service_role
    if (doctor_id) {
      const { error: linkErr } = await adminClient.rpc("link_doctor_account", {
        p_doctor_id: doctor_id,
        p_user_id: newUserId,
      });
      if (linkErr) {
        console.warn("Aviso al vincular cuenta de profesional en admin-create-user:", linkErr);
      }
    }

    // Registro en auditoría
    await adminClient.from("audit_logs").insert({
      action: "ADMIN_CREATE_USER",
      resource: "Usuarios & Roles",
      target_id: newUserId,
      user_id: callerUser.id,
      user_name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || callerUser.email,
      user_role: "superadmin",
      details: `Alta de cuenta institucional para ${email} con rol ${assignedRole}${doctor_id ? ` vinculado a ${doctor_id}` : ""}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        user_id: newUserId,
        email: email.trim().toLowerCase(),
        role: assignedRole,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Error interno del servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

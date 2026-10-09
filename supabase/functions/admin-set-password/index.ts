// Supabase Edge Function: admin-set-password (V2-A9 / V3-B2)
// Permite a los superadministradores modificar credenciales de otros usuarios
// utilizando la clave de servicio (service_role) resguardada en el backend.

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

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Usuario no autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Comprobar rol superadmin en profiles
    const { data: profile, error: profileErr } = await userClient
      .from("profiles")
      .select("role, first_name, last_name")
      .eq("id", user.id)
      .single();

    if (profileErr || profile?.role !== "superadmin") {
      return new Response(JSON.stringify({ error: "Acceso denegado: Se requiere rol superadmin" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_id, password } = await req.json();
    if (!user_id || !password) {
      return new Response(JSON.stringify({ error: "user_id y password son requeridos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // V3-B2: Longitud mínima de contraseña obligatoria
    if (typeof password !== "string" || password.trim().length < 12) {
      return new Response(
        JSON.stringify({ error: "La contraseña institucional debe contener al menos 12 caracteres." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Cliente admin con clave service_role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(
      user_id,
      { password }
    );

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // V3-B2: Registro formal e inmutable en audit_logs
    await adminClient.from("audit_logs").insert({
      action: "ADMIN_SET_PASSWORD",
      resource: "Usuarios & Roles",
      target_id: user_id,
      user_id: user.id,
      user_name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || user.email,
      user_role: "superadmin",
      details: `Modificación de credenciales para usuario destino ID ${user_id}`,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Contraseña actualizada exitosamente", user_id: updatedUser.user.id }),
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

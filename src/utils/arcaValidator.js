/**
 * Validador y generador fiscal ARCA (Agencia de Recaudación y Control Aduanero - ex AFIP)
 * Especificación WebServices Factura Electrónica (WSFEv1) y Código QR Fiscal (RG 4892)
 */

export const generateCAE = () => {
  // Simula CAE oficial de 14 dígitos numéricos
  const part1 = Math.floor(7000000 + Math.random() * 2999999);
  const part2 = Math.floor(1000000 + Math.random() * 8999999);
  const cae = `${part1}${part2}`;

  // Vencimiento de CAE: 10 días corridos a partir de la emisión
  const vtoDate = new Date();
  vtoDate.setDate(vtoDate.getDate() + 10);
  const caeVto = vtoDate.toISOString().split('T')[0];

  return { cae, caeVto };
};

export const generateAfipQRPayload = ({
  cuit = '30718293408',
  ptoVta = 1,
  tipoCmp = 6, // 1: Factura A, 6: Factura B, 11: Factura C
  nroCmp = 4821,
  importe = 1500,
  moneda = 'PES',
  cotiz = 1,
  tipoDocRec = 96, // 96: DNI, 80: CUIT, 99: Consumidor Final
  nroDocRec = '38450920',
  tipoCodAut = 'E',
  codAut = '74291823901248',
  fecha = '2026-08-28'
}) => {
  const qrObject = {
    ver: 1,
    fecha,
    cuit: Number(cuit.replace(/\D/g, '')),
    ptoVta,
    tipoCmp,
    nroCmp,
    importe: Number(importe),
    moneda,
    ctz: cotiz,
    tipoDocRec,
    nroDocRec: Number(String(nroDocRec).replace(/\D/g, '')) || 0,
    tipoCodAut,
    codAut: Number(codAut)
  };

  const jsonStr = JSON.stringify(qrObject);
  const base64Str = btoa(unescape(encodeURIComponent(jsonStr)));
  return `https://www.arca.gob.ar/fe/qr/?p=${base64Str}`;
};

export const calculateDoctorHonorarios = (montoConsulta, porcentajeHonorario = 75, retencionIIBB = 3.5) => {
  const honorarioBruto = (montoConsulta * porcentajeHonorario) / 100;
  const retencion = (honorarioBruto * retencionIIBB) / 100;
  const honorarioNeto = honorarioBruto - retencion;

  return {
    montoConsulta,
    porcentajeHonorario,
    honorarioBruto: Math.round(honorarioBruto),
    retencion: Math.round(retencion),
    honorarioNeto: Math.round(honorarioNeto)
  };
};

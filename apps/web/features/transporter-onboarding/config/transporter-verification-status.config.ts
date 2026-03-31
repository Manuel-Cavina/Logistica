import type { TransporterVerificationStatus } from "../types/transporter-profile.types";

type TransporterVerificationTone = "neutral" | "warning" | "success" | "danger";

type TransporterVerificationStatusCta = {
  href: string;
  label: string;
};

export type TransporterVerificationStatusConfig = {
  cta?: TransporterVerificationStatusCta;
  description: string;
  label: string;
  title: string;
  tone: TransporterVerificationTone;
};

type TransporterVerificationToneStyles = {
  badge: string;
  card: string;
  cardAccent: string;
};

const transporterVerificationStatusConfig = {
  INCOMPLETE: {
    cta: {
      href: "#profile-form-placeholder",
      label: "Completar perfil",
    },
    description:
      "Todavia faltan datos base para enviar tu perfil a revision y destrabar la verificacion manual.",
    label: "Perfil incompleto",
    title: "Completa tu perfil para avanzar con la verificacion",
    tone: "neutral",
  },
  PENDING: {
    description:
      "Tu informacion ya fue enviada y nuestro equipo la esta revisando. No necesitas reenviar nada por ahora.",
    label: "En revision",
    title: "Estamos verificando tu perfil de transportista",
    tone: "success",
  },
  REJECTED: {
    cta: {
      href: "#profile-form-placeholder",
      label: "Revisar datos del perfil",
    },
    description:
      "Tu perfil necesita correcciones antes de volver a revision. Revisa la informacion y vuelve a intentarlo cuando corresponda.",
    label: "Requiere correcciones",
    title: "Tu perfil necesita ajustes para volver a revision",
    tone: "danger",
  },
  VERIFIED: {
    description:
      "Tu perfil ya fue aprobado y ya puedes operar como transportista dentro de la plataforma.",
    label: "Verificado",
    title: "Tu perfil esta listo para operar",
    tone: "success",
  },
} satisfies Record<
  TransporterVerificationStatus,
  TransporterVerificationStatusConfig
>;

const transporterVerificationToneStyles: Record<
  TransporterVerificationTone,
  TransporterVerificationToneStyles
> = {
  danger: {
    badge: "border-[#e7b9a2] bg-[#fff2ea] text-[#7d3b1a]",
    card: "border-[#e7b9a2] bg-[#fff9f5]",
    cardAccent: "text-[#7d3b1a]",
  },
  neutral: {
    badge: "border-border/70 bg-background/80 text-foreground",
    card: "border-border/70 bg-panel/95",
    cardAccent: "text-foreground",
  },
  success: {
    badge: "border-[#c8e0cf] bg-[#edf8f0] text-[#1f5136]",
    card: "border-[#c8e0cf] bg-[#f5fbf6]",
    cardAccent: "text-[#1f5136]",
  },
  warning: {
    badge: "border-[#ead1be] bg-[#fff5ee] text-[#7a4a2b]",
    card: "border-[#ead1be] bg-[#fffaf5]",
    cardAccent: "text-[#7a4a2b]",
  },
};

export function getTransporterVerificationStatusConfig(
  status: TransporterVerificationStatus,
): TransporterVerificationStatusConfig {
  return transporterVerificationStatusConfig[status];
}

export function getTransporterVerificationToneStyles(
  tone: TransporterVerificationTone,
): TransporterVerificationToneStyles {
  return transporterVerificationToneStyles[tone];
}

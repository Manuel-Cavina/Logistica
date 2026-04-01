import {
  getTransporterVerificationStatusConfig,
  getTransporterVerificationToneStyles,
} from "./transporter-verification-status.config";

describe("transporterVerificationStatusConfig", () => {
  it.each([
    ["INCOMPLETE", "Perfil incompleto", "neutral"],
    ["PENDING", "En revision", "success"],
    ["VERIFIED", "Verificado", "success"],
    ["REJECTED", "Requiere correcciones", "danger"],
  ] as const)(
    "returns the expected UI config for %s",
    (status, label, tone) => {
      const config = getTransporterVerificationStatusConfig(status);

      expect(config.label).toBe(label);
      expect(config.description).toEqual(expect.any(String));
      expect(config.title).toEqual(expect.any(String));
      expect(config.tone).toBe(tone);
    },
  );

  it("defines CTA only for actionable statuses", () => {
    expect(getTransporterVerificationStatusConfig("INCOMPLETE").cta).toEqual({
      href: "#profile-form-placeholder",
      label: "Completar perfil",
    });
    expect(getTransporterVerificationStatusConfig("REJECTED").cta).toEqual({
      href: "#profile-form-placeholder",
      label: "Revisar datos del perfil",
    });
    expect(getTransporterVerificationStatusConfig("PENDING").cta).toBeUndefined();
    expect(getTransporterVerificationStatusConfig("VERIFIED").cta).toBeUndefined();
  });

  it.each(["neutral", "success", "warning", "danger"] as const)(
    "returns tone styles for %s",
    (tone) => {
      const styles = getTransporterVerificationToneStyles(tone);

      expect(styles.badge).toEqual(expect.any(String));
      expect(styles.card).toEqual(expect.any(String));
      expect(styles.cardAccent).toEqual(expect.any(String));
    },
  );
});

export const clerkAppearance = {
  variables: {
    colorPrimary: "#0b1b3f",
    colorText: "#0f172a",
    colorTextSecondary: "#64748b",
    colorBackground: "transparent",
    colorInputBackground: "#ffffff",
    colorInputText: "#0f172a",
    borderRadius: "12px",
    fontFamily: "Inter, sans-serif",
    fontSize: "15px",
  },
  elements: {
    rootBox: "w-full",
    card: "w-full shadow-none border-0 p-0 bg-transparent gap-0",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtons: "hidden",
    socialButtonsBlockButton: "hidden",
    dividerRow: "hidden",
    form: "space-y-4",
    formFieldRow: "block",
    formField: "space-y-2",
    formFieldLabel: "text-sm font-medium text-foreground",
    formFieldLabelRow: "mb-1",
    formFieldInput:
      "h-12 rounded-xl border border-input bg-background px-4 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20",
    formButtonPrimary:
      "h-12 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:bg-primary/90",
    footer: "hidden",
    footerAction: "hidden",
    identityPreview: "rounded-xl border border-border bg-muted/40",
    alternativeMethodsBlockButton:
      "h-12 rounded-xl border border-input text-sm font-medium hover:bg-muted",
    otpCodeFieldInput:
      "h-12 w-11 rounded-xl border border-input text-base font-semibold",
  },
  layout: {
    socialButtonsPlacement: "bottom",
  },
};

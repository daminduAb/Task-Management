export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  checks: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
};

// Simple, transparent scoring - each satisfied rule adds one point.
// Not cryptographic strength estimation, just clear, explainable feedback for the user.
export function getPasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passed = Object.values(checks).filter(Boolean).length;

  let score: PasswordStrength["score"];
  let label: string;
  let color: string;

  if (password.length === 0) {
    score = 0;
    label = "";
    color = "bg-border";
  } else if (passed <= 1) {
    score = 1;
    label = "Weak";
    color = "bg-priority-high";
  } else if (passed === 2 || passed === 3) {
    score = 2;
    label = "Fair";
    color = "bg-priority-medium";
  } else if (passed === 4) {
    score = 3;
    label = "Good";
    color = "bg-accent";
  } else {
    score = 4;
    label = "Strong";
    color = "bg-priority-low";
  }

  return { score, label, color, checks };
}

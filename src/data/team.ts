export type TeamMember = {
  name: string;
  role: string;
  image?: string;
  shortBio: string;
  phone?: string;
  showOnWebsite: boolean;
};

export const teamMembers: TeamMember[] = [
  {
    name: "Lab Team",
    role: "Lab Team",
    shortBio:
      "Supports careful sample handling and defined laboratory workflows.",
    showOnWebsite: true,
  },
  {
    name: "Sample Collection Team",
    role: "Sample Collection Team",
    shortBio:
      "Coordinates home sample collection and patient preparation support.",
    showOnWebsite: true,
  },
  {
    name: "Patient Support",
    role: "Patient Support",
    shortBio:
      "Helps patients with bookings, prescription support, directions and report coordination.",
    showOnWebsite: true,
  },
  {
    name: "Reporting and Coordination",
    role: "Reporting and Coordination",
    shortBio:
      "Supports clear communication and digital report coordination through defined lab processes.",
    showOnWebsite: true,
  },
];

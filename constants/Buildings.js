const BUILDINGS = [
  { name: "Engineering Building", aliases: ["EB", "Watson Engineering", "Engineering"], lat: 42.0879, lng: -75.9690, address: "4400 Vestal Pkwy E, Vestal, NY 13850", description: "Watson College of Engineering. Houses CS, EE, ME, and BME." },
  { name: "Science Building", aliases: ["Science 1", "S1", "Science 2", "S2", "Science"], lat: 42.0893, lng: -75.9671, address: "4400 Vestal Pkwy E, Vestal, NY 13850", description: "Physics, Chemistry, Biology, and Math departments." },
  { name: "Bartle Library", aliases: ["Library Tower", "Library", "Bartle"], lat: 42.0887, lng: -75.9694, address: "4400 Vestal Pkwy E, Vestal, NY 13850", description: "16-story main library. Open 24/7 during finals." },
  { name: "University Union", aliases: ["UU", "Union", "Student Union"], lat: 42.0882, lng: -75.9680, address: "4400 Vestal Pkwy E, Vestal, NY 13850", description: "Student center with dining, bookstore, game room." },
  { name: "Events Center", aliases: ["EC", "BU Events Center"], lat: 42.0918, lng: -75.9673, address: "4400 Vestal Pkwy E, Vestal, NY 13850", description: "5,000-seat arena for basketball, concerts, commencement." },
  { name: "Fine Arts Building", aliases: ["FA", "Fine Arts"], lat: 42.0895, lng: -75.9702, address: "4400 Vestal Pkwy E, Vestal, NY 13850", description: "Art studios, galleries, and performance spaces." },
  { name: "Innovative Technologies Complex", aliases: ["ITC", "Innovation Center"], lat: 42.0870, lng: -75.9685, address: "4400 Vestal Pkwy E, Vestal, NY 13850", description: "Research facility, startup incubator, computing labs." },
  { name: "Fleishman Career Center", aliases: ["Career Center", "Fleishman"], lat: 42.0884, lng: -75.9676, address: "4400 Vestal Pkwy E, Vestal, NY 13850", description: "Career advising, resume reviews, mock interviews." },
  { name: "Anderson Center", aliases: ["PAC", "Performing Arts", "Anderson"], lat: 42.0890, lng: -75.9710, address: "4400 Vestal Pkwy E, Vestal, NY 13850", description: "Concert halls, theater stages, 100+ performances/year." },
  { name: "Hinman Dining Hall", aliases: ["Hinman", "Hinman DH"], lat: 42.0905, lng: -75.9660, address: "4400 Vestal Pkwy E, Vestal, NY 13850", description: "Main dining hall. Kosher and halal options available." },
  { name: "Classroom Wing", aliases: ["CW", "Lecture Halls", "Lecture Hall", "LH"], lat: 42.0891, lng: -75.9688, address: "4400 Vestal Pkwy E, Vestal, NY 13850", description: "Large lecture halls (LH1-LH14) and seminar rooms." },
  { name: "Health Sciences Building", aliases: ["Decker", "Nursing Building"], lat: 42.0875, lng: -75.9665, address: "4400 Vestal Pkwy E, Vestal, NY 13850", description: "Decker College of Nursing. Simulation and clinical labs." },
  { name: "Smart Energy Building", aliases: ["SL", "Smart Energy"], lat: 42.0876, lng: -75.9692, address: "4400 Vestal Pkwy E, Vestal, NY 13850", description: "Smart energy research and classrooms." },
  { name: "West Gym", aliases: ["Gym", "West Gymnasium"], lat: 42.0886, lng: -75.9705, address: "4400 Vestal Pkwy E, Vestal, NY 13850", description: "Gymnasium, fitness center, basketball courts." },
  { name: "Art Museum", aliases: ["BUAM", "Binghamton University Art Museum"], lat: 42.0893, lng: -75.9700, address: "4400 Vestal Pkwy E, Vestal, NY 13850", description: "University art museum with rotating exhibitions." },
];

export function findBuilding(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const b of BUILDINGS) {
    if (lower.includes(b.name.toLowerCase())) return b;
    for (const alias of b.aliases) {
      if (lower.includes(alias.toLowerCase())) return b;
    }
  }
  return null;
}

export default BUILDINGS;

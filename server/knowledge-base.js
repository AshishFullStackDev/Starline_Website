/**
 * Starline Adventures Pvt. Ltd. — Centralized Verified Knowledge Base
 * Extracted strictly from verified website content:
 * - js/products-catalog.js (33 products: 18 activities, 15 equipment items)
 * - js/project-details.js (7 completed projects)
 * - about.html, team.html, contact.html
 */

const COMPANY_PROFILE = {
  legalName: 'Starline Adventures Pvt Ltd',
  brandName: 'STARLINE ADVENTURES',
  tagline: 'Adventure Equipment Manufacturer & Installation Expert',
  headquarters: {
    address: 'Opposite Government Guest House, Saraswati Nagar, Laxmi Nagar, Nagpur – 441302, Maharashtra, India',
    city: 'Nagpur',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '441302'
  },
  contact: {
    primaryPhone: '+91-94249-04000',
    alternatePhone: '+91-9421-244-244',
    whatsappUrl: 'https://wa.me/919424904000',
    email: 'starlineadventure@gmail.com',
    website: 'https://starlineadventure.com'
  },
  leadership: [
    { name: 'Pramod Kumeriya', role: 'Founder & CEO' },
    { name: 'Pradip Jukseniya', role: 'COO' },
    { name: 'Samiksha Kumeriya', role: 'Marketing Manager' },
    { name: 'Divya Balpande', role: 'Sales Manager' },
    { name: 'Ashish Naik', role: 'Social Media & Brand Manager' }
  ],
  capabilities: [
    'In-house manufacturing and structural steel fabrication facility in Nagpur',
    'Custom engineering, 3D CAD modeling, and site-specific dynamic load calculation',
    'High-tensile structural steel, galvanized aircraft/wire ropes, and CE/EN/UIAA certified PPE components',
    'Turnkey project execution across India (pan-India installation & maintenance support)',
    '6-Phase Turnkey Workflow: (1) Site Feasibility & Survey, (2) 3D Design & Load Analysis, (3) In-House Fabrication, (4) Field Erection & Rigging, (5) Proof-Load Testing, (6) Staff Training & Handover'
  ],
  warrantyAndSupport: {
    structuralReplacementGuarantee: '6-month Structural Replacement Guarantee for eligible structural and manufacturing components (under standard Starline service agreements; terms apply based on final project specifications)',
    preventiveMaintenanceSupport: '1-year Preventive Maintenance Support including scheduled safety inspections, cable tension checks, and operator refresher training (under standard Starline service agreements)'
  },
  clientSegments: [
    'Resorts & Hotels',
    'Adventure Parks & Amusement Destinations',
    'Eco-Tourism & Forest / Wildlife Reserves',
    'Agro-Tourism & Farm Stays',
    'Schools, Colleges & Institutional Campuses',
    'Government & Tourism Projects',
    'Builders, Architects & Landowners'
  ]
};

const VERIFIED_ACTIVITIES = [
  {
    name: 'Zip Line',
    summary: 'Overhead galvanized wire-rope zip line connecting takeoff and landing platforms across canopies, lakes, hills, or resort grounds.',
    ageGroup: '6 years & above',
    installationType: 'Outdoor Nature Park / Resort / Hill Station',
    capacity: 'Max 110 kg per rider',
    spanOrDimensions: '50m to 1000m+ customized span',
    components: 'Mild steel launch/landing towers, Usha Martin galvanized wire rope, tiger U-clamps, thimbles, turnbuckles, tandem high-speed ball-bearing pulleys, zip stopper brake, seat/full-body harnesses, helmets'
  },
  {
    name: 'Giant Swing',
    summary: 'Massive A-frame pendulum swing hoisting 2 to 4 riders before mechanical release into a high-speed free-fall arc.',
    ageGroup: '10 years & above',
    installationType: 'Outdoor / Cliff / Open Ground',
    capacity: '2 to 4 persons simultaneously',
    spanOrDimensions: 'Tower height options: 40ft / 50ft / 60ft / 70ft / 100ft',
    components: 'Heavy MS structural frame, 3HP industrial gearbox and brake motor, remote console, multi-rider swing harness, alloy/iron carabiners, 12mm galvanized wire rope, quick-release lock'
  },
  {
    name: 'Rocket Ejection',
    summary: 'High-altitude twin-tower reverse bungee catapult launching riders skyward.',
    ageGroup: '10 years & above',
    installationType: 'Outdoor Destination / Theme Park',
    capacity: 'Max 100 kg per rider',
    spanOrDimensions: 'Footprint: 15ft (W) x 30ft (L) x 42ft (H)',
    components: 'Structural steel towers, 3-phase electric brake motor, worm gearbox, remote control console, 12mm bungee cord, 12mm static rope, carabiners, harness, helmet'
  },
  {
    name: '4 in 1 Bungee Jumping (Bungee Trampoline)',
    summary: 'Four-station motorized bungee trampoline setup enabling jumpers to bounce up to ~25 ft and perform flips safely.',
    ageGroup: '6 to 15 years & adults',
    installationType: 'Outdoor / Indoor Arena',
    capacity: '4 simultaneous jumpers (Max 80 kg each)',
    spanOrDimensions: 'Footprint: 35ft x 35ft',
    components: '3-phase electric brake motors, worm gearbox, central remote panel, pulleys, alloy carabiners, static ropes, heavy bungee cords, full-body harnesses, commercial trampolines'
  },
  {
    name: 'Zip Bike / Sky Cycle',
    summary: 'Elevated bicycle suspended on an overhead cable line with counterweights and redundant safety tethers.',
    ageGroup: '10 years & above',
    installationType: 'Indoor / Outdoor Aerial Circuit',
    capacity: 'Max 110 kg',
    spanOrDimensions: 'Single cycle, double cycle, or two-way reciprocal line',
    components: 'Mild steel terminal frames, galvanized wire ropes, alloy-wheel sports cycles, 360-degree rotating harness connector, safety seat belts, helmets, tandem pulleys'
  },
  {
    name: 'Sky Roller',
    summary: 'Rolling cylindrical wheel-cage gliding suspended along an elevated cable track.',
    ageGroup: '10 years & above',
    installationType: 'Outdoor Adventure Park',
    capacity: 'Max 110 kg',
    spanOrDimensions: 'Track span: 50m to 200m',
    components: 'Mild steel rolling cage structure, galvanized high-tension wire rope, tandem safety pulleys, harness system, helmet, impact buffers'
  },
  {
    name: 'Wall Climbing',
    summary: 'Custom artificial climbing wall in realistic 3D FRP rock textures or modular bouldering panels with auto-belay / manual belay anchors.',
    ageGroup: '6 years & above',
    installationType: 'Outdoor / Indoor Facility',
    capacity: 'Max 110 kg per lane',
    spanOrDimensions: 'Wall height: 20ft to 50ft+ (Customized)',
    components: 'Heavy structural MS framework, heavy-grade FRP panels, modular holds, static & dynamic ropes, auto-belay / GRI-GRI devices, harnesses, landing mats'
  },
  {
    name: 'Net Climbing',
    summary: 'Tensioned braided nylon and steel-core rope cargo net for vertical or diagonal climbing.',
    ageGroup: '6 years & above',
    installationType: 'Outdoor / Adventure Tower',
    capacity: 'Continuous multi-user flow',
    spanOrDimensions: 'Tailored to tower or frame dimensions',
    components: 'Mild steel framework, UV-resistant braided nylon cargo netting, steel wire ropes, U-clamps, harnesses, helmets, carabiners'
  },
  {
    name: 'Ninja Rope Courses (High & Low Rope Courses)',
    summary: 'Modular 1, 2, or 3-tier aerial obstacle course featuring suspended bridges, swinging logs, balance beams, and continuous safety belay lifelines.',
    ageGroup: '6 years & above',
    installationType: 'Indoor / Outdoor',
    capacity: '20 to 60 users/hr continuous throughput',
    spanOrDimensions: '1, 2, or 3 elevated tiers',
    components: 'Structural steel support columns, FRP elements, treated hardwood planks, steel wire ropes, continuous belay track, certified harnesses, helmets'
  },
  {
    name: 'Multi Activity Tower',
    summary: 'Compact centralized structural steel tower combining 4 to 8 activities such as wall climbing, rappelling, zipline takeoff, net climb, and quick-jump.',
    ageGroup: '6 years & above',
    installationType: 'Outdoor Adventure Park / Resort',
    capacity: '20 to 30 simultaneous participants',
    spanOrDimensions: 'Tower height: 35ft to 60ft',
    components: 'Heavy structural MS lattice framework, corrosion-resistant coating, modular platforms, anchor brackets, safety railings, wire ropes, PPE'
  },
  {
    name: 'Glass Bridge',
    summary: 'Suspended scenic skywalk built with triple-layer toughened laminated safety glass and structural steel trusses.',
    ageGroup: 'All ages (5 years & above)',
    installationType: 'Outdoor Valley / Hill / Resort',
    capacity: '50 to 100+ visitors simultaneously',
    spanOrDimensions: 'Bridge span: 20m to 150m+ (Site tailored)',
    components: 'Structural steel trusses, toughened laminated multi-layer sandwich glass panels, galvanized stay wire ropes, stainless steel balustrades'
  },
  {
    name: 'Suspension Bridge',
    summary: 'Swaying adventure walkway suspended across valleys, rivers, or tree canopies with anti-slip decking and safety mesh.',
    ageGroup: 'All age groups',
    installationType: 'Outdoor Landscape / River Crossing',
    capacity: '50 to 80 persons simultaneously',
    spanOrDimensions: '50ft to 500ft length x 6ft width',
    components: 'Galvanized steel wire ropes, mild steel anchor frames, weather-treated wooden/composite decking, protection mesh'
  },
  {
    name: 'Human Gyro',
    summary: '3-axis concentric rotating gyroscope ride delivering weightless 360-degree rotation.',
    ageGroup: '8 years & above',
    installationType: 'Indoor / Outdoor',
    capacity: '2-Seater (200 kg) up to 6-Seater (600 kg)',
    spanOrDimensions: 'Footprint: 8ft x 15ft',
    components: 'Heavy MS tubular concentric rings, foam padded bucket seats, 3HP gearbox with electric motor & control panel, 4-point safety harnesses'
  },
  {
    name: '360 Degree Cycle',
    summary: 'Counterbalanced bicycle mounted inside a circular steel loop allowing riders to pedal a full 360-degree vertical inversion.',
    ageGroup: '8 years to adults (up to 80 kg)',
    installationType: 'Outdoor / Indoor Adventure Zone',
    capacity: 'Max 80 kg',
    spanOrDimensions: '6ft (W) x 10ft (L) x 12ft (H)',
    components: 'Metallic circular steel structure, alloy-wheel sports bicycle, full-body harness, safety helmet, counterweight assembly'
  },
  {
    name: 'Mechanical Bull Ride',
    summary: 'Motorized bucking and spinning rodeo bull ride surrounded by a cushioned commercial inflatable arena.',
    ageGroup: '7 years & above',
    installationType: 'Indoor / Outdoor',
    capacity: '1 rider at a time (Max 90–100 kg)',
    spanOrDimensions: '16ft diameter ring, 2ft height',
    components: 'Metallic steel chassis, 460 GSM commercial inflatable base, FRP bull body, single-phase motor with dual-axis gearbox, digital control console, air blower'
  },
  {
    name: 'Rifle Shooting Range',
    summary: 'Supervised 10-meter target shooting gallery using 0.177 calibre air rifles with pellet-catchers and ballistic safety backstops.',
    ageGroup: '10 years & above',
    installationType: 'Indoor / Outdoor Range',
    capacity: '2 to 6 shooting lanes',
    spanOrDimensions: '10-meter standard target distance',
    components: '0.177 calibre target air rifles, steel pellet-catcher target boxes, lane partitions, ballistic safety backstop curtains, safety glasses'
  },
  {
    name: 'Archery Range',
    summary: 'Supervised bow-and-arrow target range equipped with recurve/compound bows, fiberglass arrows, target stands, and arrow-stop safety netting.',
    ageGroup: '8 years & above',
    installationType: 'Outdoor / Indoor',
    capacity: '2 to 6 target lanes',
    spanOrDimensions: '5m to 20m shooting distances',
    components: 'Recurve & compound bows (15–25 lbs draw weight), fiberglass target arrows, layered target bosses, arm guards, finger tabs, arrow-stop netting'
  },
  {
    name: 'Trampoline / Trampoline Park',
    summary: 'Commercial adventure trampolines and modular multi-bay trampoline arenas with 360-degree enclosure nets.',
    ageGroup: '4 years & above',
    installationType: 'Indoor Arena / Outdoor Adventure Park',
    capacity: 'Single to multi-bay arenas (Max 100 kg per jumper)',
    spanOrDimensions: 'Custom modular sizes from 10ft round to multi-bay continuous arenas',
    components: 'Heavy galvanized steel tubular frame, high-tensile carbon steel springs, UV-stabilized polypropylene mat, 20mm safety padding, enclosure net'
  }
];

const VERIFIED_EQUIPMENT = [
  'Open Gym Equipment (Air Walker, Chest Press, Lat Pull-Down, Shoulder Builder, Twister, Leg Press, Sit-up Bench, Cross Trainer; galvanized B-Class MS pipe)',
  'Climbing Wall Equipment (Modular holds, M10 T-nuts & bolts, top anchors, auto-belays; CE / EN 12572 compliant, 25 kN anchors)',
  'Rope Course Equipment (Continuous belay trolleys, 10–16mm galvanized wire ropes, turnbuckles, clamps, thimbles; EN 15567 compliant, 22–30 kN hardware)',
  'Safety Nets (UV-stabilized nylon/polypropylene fall-arrest & debris nets, 40–100mm mesh, 12–16mm border ropes)',
  'Safety Harness & Belts (Full-body, sit, chest, kids harnesses; 22 kN breaking strength; CE/EN 361, EN 12277, IS 3521)',
  'Zipline Equipment (Dual-sheave sealed-bearing tandem trolleys certified up to 100 km/h, 8–16mm cables, spring/bungee brake systems; CE EN 12278 & ACCT compliant)',
  'Climbing Ropes & Carabiners (9.5–14mm CE/UIAA kernmantle ropes 28–35 kN, auto-lock/screw-lock carabiners 25–50 kN, Figure-8/ATC belay devices; EN 1891, EN 892, EN 362, EN 12275)',
  'Climbing Holds & Wall Panels (Textured PU holds, 3D FRP rock panels, 18–21mm birch multiplex boards; EN 12572-1 & EN 12572-3)',
  'Rope Course Platforms & Obstacles (Hexagonal/octagonal/square platforms, Burma bridge, commando crossing, swinging logs, spider webs; EN 15567-1 & EN 15567-2)',
  'Adventure Park Platforms (IS 2062 structural steel takeoff/landing hubs, chequered diamond plate/FRP grating, 1.2m balustrades, 22 kN PPE anchor eyelets, 500 kg/m² live load)',
  'Cargo Nets & Net Bridges (12–18mm UV-stabilized braided nylon/PP ropes, cylindrical/V-profile/U-channel suspended bridges)',
  'Tyre & Balance Obstacles (Swinging tyre steps, tyre crawl tunnels, quartz-grit anti-slip balance beams, 5:1 safety factor)',
  'Adventure Park Ladders & Bridges (Monkey bars, wave ladders, flexible rope ladders, pedestrian suspension bridges 10m–150m+)',
  'Safety Helmets & Fall-Arrest Systems (ABS helmets EN 12492, Self-Retracting Lifelines EN 360, Y-lanyards EN 355, auto-descent rescue kits EN 341)',
  'Steel Cables, Anchors & Rigging Equipment (8–24mm 1770/1960 N/mm² IWRC galvanized wire ropes IS 2266/ISO 2408, turnbuckles, Tiger clamps, M12–M30 chemical anchors, helical earth anchors)'
];

const VERIFIED_PROJECTS = [
  {
    name: 'The Grand Machal Resorts',
    location: 'Indore, Madhya Pradesh',
    type: 'Destination Resort Adventure Zone',
    activities: 'High-speed zip lines, multi-level rope course, sky attractions, wall climbing'
  },
  {
    name: 'Ikya Island Mussoorie',
    location: 'Mussoorie, Uttarakhand',
    type: 'Hillside Adventure Park',
    activities: 'Scenic mountain rides, 360 gyro attraction, elevated challenge courses, aerial swings'
  },
  {
    name: 'Forest Department, Khandwa',
    location: 'Khandwa, Madhya Pradesh',
    type: 'Government Eco-Tourism & Canopy Trail',
    activities: 'Nature canopy trails, wildlife watchtower climbing, low-impact aerial bridges, survival obstacles (tree-friendly non-invasive hardware)'
  },
  {
    name: 'Pench Tiger Reserve',
    location: 'Madhya Pradesh',
    type: 'Eco-Tourism & Wildlife Sanctuary Adventure Installation',
    activities: 'Canopy walkways, eco adventure circuits, watchtower observation climbing, guided rope traverses'
  },
  {
    name: 'Devgad Zipline (Flying Kokan)',
    location: 'Devgad, Maharashtra',
    type: 'Coastal High-Speed Zipline Installation',
    activities: 'Long-span ocean-view zipline over the Arabian Sea, sea-breeze aerial crossing, outdoor climbing walls (marine-grade anti-corrosive rigging)'
  },
  {
    name: 'Maniratna Resort',
    location: 'Amravati, Maharashtra',
    type: 'Luxury Resort Adventure & Leisure Park',
    activities: 'High rope obstacle course, sky cycling, low rope junior circuits, rock climbing wall'
  },
  {
    name: 'Srushti Farms',
    location: 'Nagpur, Maharashtra',
    type: 'Agro-Tourism & Family Adventure Hub',
    activities: 'Multi-level rope obstacle course, twin zip lines, giant swings, children adventure zone'
  }
];

function buildVerifiedKnowledgeText() {
  const activitiesText = VERIFIED_ACTIVITIES.map((a, idx) =>
    `${idx + 1}. ${a.name}: ${a.summary} | Age: ${a.ageGroup} | Type: ${a.installationType} | Capacity: ${a.capacity} | Span/Dimensions: ${a.spanOrDimensions} | Key Components: ${a.components}`
  ).join('\n');

  const equipmentText = VERIFIED_EQUIPMENT.map((e, idx) => `${idx + 1}. ${e}`).join('\n');

  const projectsText = VERIFIED_PROJECTS.map((p, idx) =>
    `${idx + 1}. ${p.name} (${p.location}) — ${p.type}. Installed: ${p.activities}.`
  ).join('\n');

  return `
=== VERIFIED STARLINE ADVENTURES COMPANY KNOWLEDGE ===
Company: ${COMPANY_PROFILE.legalName} (${COMPANY_PROFILE.brandName})
Tagline: ${COMPANY_PROFILE.tagline}
Headquarters & Manufacturing Plant: ${COMPANY_PROFILE.headquarters.address}
Contact Phone: ${COMPANY_PROFILE.contact.primaryPhone} / ${COMPANY_PROFILE.contact.alternatePhone}
WhatsApp: ${COMPANY_PROFILE.contact.whatsappUrl}
Email: ${COMPANY_PROFILE.contact.email}
Website: ${COMPANY_PROFILE.contact.website}

Leadership Team:
${COMPANY_PROFILE.leadership.map(m => `- ${m.name}: ${m.role}`).join('\n')}

Core Verified Capabilities:
${COMPANY_PROFILE.capabilities.map(c => `- ${c}`).join('\n')}

Warranty & Post-Handover Support:
- ${COMPANY_PROFILE.warrantyAndSupport.structuralReplacementGuarantee}
- ${COMPANY_PROFILE.warrantyAndSupport.preventiveMaintenanceSupport}

Verified Adventure Activities & Rides (18 Core Attractions):
${activitiesText}

Verified Equipment & Safety Hardware (15 Product Lines):
${equipmentText}

Verified Completed Projects Across India (7 Featured Case Studies):
${projectsText}

=== IMPORTANT VERIFICATION BOUNDARIES (DO NOT VIOLATE) ===
1. Pricing & Quotes: Starline Adventures does NOT publish fixed prices or rate cards on the website. All quotations depend on site topography, span/tower height, capacity, location, and scope. Never invent INR/USD prices as official Starline prices. If helpful, explain general industry factors affecting cost and offer a custom engineering quotation via Request Quote, Phone (+91-94249-04000), or WhatsApp.
2. Water Parks & Unlisted Attractions: Starline's verified catalog covers adventure rides, aerial rope courses, ziplines, climbing walls, towers, trampolines, target ranges, open gym, and PPE/rigging equipment. Water slides, wave pools, roller coasters, or water filtration systems are NOT listed in Starline's verified product catalog. For water park or unlisted attraction questions: (a) give thorough, genuinely helpful general industry planning advice first, and (b) clearly clarify which items are general industry recommendations vs. what needs confirmation from Starline's engineering & sales team.
3. Custom Engineering Specs: Only quote exact dimensions, capacities, or component standards explicitly listed above. Never claim unverified certifications, custom spans/heights not confirmed by site engineering, or AI-estimated structural layouts as approved engineering designs. Always state that final sizing, foundation, and structural specifications require an on-site feasibility survey and engineering sign-off.
`.trim();
}

module.exports = {
  COMPANY_PROFILE,
  VERIFIED_ACTIVITIES,
  VERIFIED_EQUIPMENT,
  VERIFIED_PROJECTS,
  buildVerifiedKnowledgeText
};

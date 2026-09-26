const fs = require('fs');
const path = require('path');

// Read existing catalog
const catalogFile = fs.readFileSync(path.join(__dirname, 'js', 'products-catalog.js'), 'utf8');
const catalogMatch = catalogFile.match(/const STARLINE_PRODUCTS = (\[[\s\S]*?\n\];)/);
if (!catalogMatch) {
  console.error("Could not parse STARLINE_PRODUCTS from js/products-catalog.js");
  process.exit(1);
}

const STARLINE_PRODUCTS = eval(catalogMatch[1]);
console.log(`Loaded ${STARLINE_PRODUCTS.length} authentic products from catalog.`);

// Canonical clean slugs
const PRODUCT_SLUGS = {
  'rocket-ejection': 'rocket-ejection-ride-manufacturer',
  'giant-swing': 'giant-swing-manufacturer',
  '4-in-1-bungee-jumping': 'bungee-jumping-setup-manufacturer',
  'zip-line': 'zipline-manufacturer',
  'zip-bike-sky-cycle': 'sky-cycling-manufacturer',
  'sky-roller': 'sky-roller-ride-manufacturer',
  'wall-climbing': 'climbing-wall-manufacturer',
  'net-climbing': 'net-climbing-manufacturer',
  'ninja-rope-courses': 'rope-course-manufacturer',
  'multi-activity-tower': 'multi-activity-tower-manufacturer',
  'glass-bridge': 'glass-bridge-manufacturer',
  'suspension-bridge': 'suspension-bridge-manufacturer',
  'human-gyro': 'human-gyro-ride-manufacturer',
  'zipline roller-coaster': 'zipline-roller-coaster-manufacturer',
  '360-degree-cycle': '360-degree-cycle-manufacturer',
  'bull-ride': 'mechanical-bull-ride-manufacturer',
  'rifle-shooting': 'rifle-shooting-range-setup',
  'archery': 'archery-range-setup',
  'trampoline': 'trampoline-park-manufacturer',
  'open-gym-equipment': 'open-gym-equipment-manufacturer',
  'climbing-wall-equipment': 'climbing-wall-equipment-manufacturer',
  'rope-course-equipment': 'rope-course-equipment-manufacturer',
  'safety-nets': 'adventure-safety-nets-manufacturer',
  'safety-harness-belts': 'adventure-safety-harness-manufacturer',
  'zipline-equipment': 'zipline-equipment-manufacturer',
  'climbing-ropes-carabiners': 'climbing-ropes-carabiners-supplier',
  'climbing-holds-wall-panels': 'climbing-holds-wall-panels-manufacturer',
  'rope-course-platforms-obstacles': 'rope-course-platforms-obstacles-manufacturer',
  'adventure-park-platforms': 'adventure-park-platforms-manufacturer',
  'cargo-nets-net-bridges': 'cargo-nets-net-bridges-manufacturer',
  'tyre-balance-obstacles': 'tyre-balance-obstacles-manufacturer',
  'adventure-park-ladders-bridges': 'adventure-park-ladders-bridges-manufacturer',
  'safety-helmets-fall-arrest-systems': 'safety-helmets-fall-arrest-systems',
  'steel-cables-anchors-rigging-equipment': 'steel-cables-anchors-rigging-equipment'
};

// Aliases for 301 redirects
const REDIRECT_ALIASES = {
  'giant-swing': 'giant-swing-manufacturer',
  'zipline': 'zipline-manufacturer',
  'zip-line': 'zipline-manufacturer',
  'rocket-ejection': 'rocket-ejection-ride-manufacturer',
  'glass-bridge': 'glass-bridge-manufacturer',
  'rope-course': 'rope-course-manufacturer',
  'ninja-rope-courses': 'rope-course-manufacturer',
  'climbing-wall': 'climbing-wall-manufacturer',
  'wall-climbing': 'climbing-wall-manufacturer',
  'sky-cycling': 'sky-cycling-manufacturer',
  'zip-bike-sky-cycle': 'sky-cycling-manufacturer',
  'sky-cycle': 'sky-cycling-manufacturer',
  'sky-roller': 'sky-roller-ride-manufacturer',
  'human-gyro': 'human-gyro-ride-manufacturer',
  'multi-activity-tower': 'multi-activity-tower-manufacturer',
  'tower': 'multi-activity-tower-manufacturer',
  'suspension-bridge': 'suspension-bridge-manufacturer',
  'zipline-roller-coaster': 'zipline-roller-coaster-manufacturer',
  'zipline roller-coaster': 'zipline-roller-coaster-manufacturer',
  '360-degree-cycle': '360-degree-cycle-manufacturer',
  'bull-ride': 'mechanical-bull-ride-manufacturer',
  '4-in-1-bungee-jumping': 'bungee-jumping-setup-manufacturer',
  'bungee-jumping': 'bungee-jumping-setup-manufacturer',
  'net-climbing': 'net-climbing-manufacturer',
  'rifle-shooting': 'rifle-shooting-range-setup',
  'archery': 'archery-range-setup',
  'trampoline': 'trampoline-park-manufacturer',
  'open-gym-equipment': 'open-gym-equipment-manufacturer',
  'climbing-wall-equipment': 'climbing-wall-equipment-manufacturer',
  'rope-course-equipment': 'rope-course-equipment-manufacturer',
  'safety-nets': 'adventure-safety-nets-manufacturer',
  'safety-harness-belts': 'adventure-safety-harness-manufacturer',
  'zipline-equipment': 'zipline-equipment-manufacturer',
  'climbing-ropes-carabiners': 'climbing-ropes-carabiners-supplier',
  'climbing-holds-wall-panels': 'climbing-holds-wall-panels-manufacturer',
  'rope-course-platforms-obstacles': 'rope-course-platforms-obstacles-manufacturer',
  'adventure-park-platforms': 'adventure-park-platforms-manufacturer',
  'cargo-nets-net-bridges': 'cargo-nets-net-bridges-manufacturer',
  'tyre-balance-obstacles': 'tyre-balance-obstacles-manufacturer',
  'adventure-park-ladders-bridges': 'adventure-park-ladders-bridges-manufacturer',
  'safety-helmets-fall-arrest-systems': 'safety-helmets-fall-arrest-systems',
  'steel-cables-anchors-rigging-equipment': 'steel-cables-anchors-rigging-equipment'
};

// Genuine project mapping for relevant products
const GENUINE_PROJECTS = {
  'giant-swing': [
    { name: 'The Grand Machal Resorts', location: 'Indore, Madhya Pradesh', scope: 'High-altitude adventure zone including Giant Pendulum Swing and aerial thrill attractions.' },
    { name: 'Ikya Island Mussoorie', location: 'Mussoorie, Uttarakhand', scope: 'Hillside high-altitude aerial swing installation with weather-proof redundant rigging.' },
    { name: 'Maniratna Resort', location: 'Amravati, Maharashtra', scope: 'Complete resort adventure setup featuring multi-rider thrill swings and obstacle circuits.' }
  ],
  'zip-line': [
    { name: 'Devgad Zipline (Flying Kokan)', location: 'Devgad, Maharashtra', scope: 'Landmark coastal long-span high-speed zipline overlooking the Arabian Sea with 316 stainless marine rigging.' },
    { name: 'The Grand Machal Resorts', location: 'Indore, Madhya Pradesh', scope: 'High-speed twin dual-cable zipline network with automatic deceleration braking system.' },
    { name: 'Forest Department Khandwa', location: 'Khandwa, Madhya Pradesh', scope: 'Eco-tourism canopy zipline trail integrating minimal tree-impact anchoring systems.' }
  ],
  'ninja-rope-courses': [
    { name: 'The Grand Machal Resorts', location: 'Indore, Madhya Pradesh', scope: 'Multi-level high rope obstacle challenge course featuring continuous lifeline safety track.' },
    { name: 'Maniratna Resort', location: 'Amravati, Maharashtra', scope: 'High and low rope adventure obstacle course designed for high guest throughput.' },
    { name: 'Srushti Farms', location: 'Nagpur, Maharashtra', scope: 'Agro-tourism multi-tier obstacle rig with Burmese bridges, swinging logs, and cargo nets.' }
  ],
  'wall-climbing': [
    { name: 'The Grand Machal Resorts', location: 'Indore, Madhya Pradesh', scope: 'Multi-pitch artificial climbing wall with FRP textured panels and auto-belay fall arrest.' },
    { name: 'Devgad Adventure Park', location: 'Devgad, Maharashtra', scope: 'Weather-shield outdoor climbing wall structure with modular holds and dual-anchor stations.' },
    { name: 'Maniratna Resort', location: 'Amravati, Maharashtra', scope: 'Commercial climbing wall with multi-lane belay stations for resort guests.' }
  ],
  'zip-bike-sky-cycle': [
    { name: 'Maniratna Resort', location: 'Amravati, Maharashtra', scope: 'Elevated dual-cycle sky track installation engineered with counterbalanced sports cycles.' },
    { name: 'The Grand Machal Resorts', location: 'Indore, Madhya Pradesh', scope: 'Scenic aerial sky cycling circuit crossing resort gardens on high-tension wire ropes.' }
  ],
  'rocket-ejection': [
    { name: 'The Grand Machal Resorts', location: 'Indore, Madhya Pradesh', scope: 'Flagship twin-tower reverse bungee rocket ejection installation with electric automated winch.' },
    { name: 'Ikya Island Mussoorie', location: 'Mussoorie, Uttarakhand', scope: 'High-adrenaline catapult ride engineered for high-altitude mountain wind loads.' }
  ],
  'glass-bridge': [
    { name: 'Ikya Island Mussoorie', location: 'Mussoorie, Uttarakhand', scope: 'Suspended valley glass skywalk with triple-laminated toughened safety glass and steel trusses.' },
    { name: 'Devgad Coastal Walk', location: 'Devgad, Maharashtra', scope: 'Marine-treated scenic glass cantilever viewing platform over coastal cliffs.' }
  ],
  'multi-activity-tower': [
    { name: 'Srushti Farms', location: 'Nagpur, Maharashtra', scope: 'Four-sided adventure tower integrating zipline takeoff, wall climbing, rappelling, and net climb.' },
    { name: 'The Grand Machal Resorts', location: 'Indore, Madhya Pradesh', scope: 'Multi-level structural lattice activity tower accommodating 25+ simultaneous participants.' }
  ],
  'human-gyro': [
    { name: 'Ikya Island Mussoorie', location: 'Mussoorie, Uttarakhand', scope: '3-axis 360-degree interactive aerospace simulation human gyro ride.' },
    { name: 'The Grand Machal Resorts', location: 'Indore, Madhya Pradesh', scope: 'High-throughput motorized multi-rider human gyro attraction.' }
  ],
  'suspension-bridge': [
    { name: 'Pench Tiger Reserve', location: 'Madhya Pradesh', scope: 'Eco-sensitive canopy suspension walkway and wildlife observation crossing.' },
    { name: 'Forest Department Khandwa', location: 'Khandwa, Madhya Pradesh', scope: 'Nature reserve hanging bridge across natural stream with anti-rot timber decking.' }
  ]
};

// Default projects for items without explicit custom mapping
const DEFAULT_PROJECTS = [
  { name: 'The Grand Machal Resorts', location: 'Indore, Madhya Pradesh', scope: 'Complete adventure park development and equipment supply by Starline Adventures.' },
  { name: 'Devgad Zipline & Adventure Park', location: 'Devgad, Maharashtra', scope: 'High-altitude adventure rides and certified safety rigging infrastructure.' },
  { name: 'Srushti Farms Adventure Park', location: 'Nagpur, Maharashtra', scope: 'Commercial adventure park equipment fabrication, installation, and load-test certification.' }
];

// Rich Product Content Map
const PRODUCT_RICH_DATA = {
  'giant-swing': {
    keyword: 'giant swing manufacturer',
    seoTitle: 'Giant Swing Manufacturer in India | Starline Adventures',
    metaDesc: 'Starline Adventures is a leading Giant Swing manufacturer and installation specialist in India, building commercial A-frame pendulum swings with certified safety systems for adventure parks and resorts.',
    h1: 'Giant Swing Manufacturer in India',
    tagline: 'High-altitude commercial pendulum swings engineered for exhilarating freefall release, unmatched safety, and rapid guest throughput across India.',
    manufacturing: 'Starline Adventures manufactures heavy-duty commercial Giant Swings fabricated using IS 2062 Grade structural mild steel with precision CNC jointing, heavy gusset reinforcements, and multi-layer anti-corrosive epoxy and polyurethane finishes. Each A-frame swing structure is designed to absorb extreme dynamic oscillation forces while maintaining complete geometric rigidity under peak swinging cycles.',
    engineering: 'Our engineering process encompasses rigorous structural load simulations, wind load calculations (conforming to IS 875 Part 3), dynamic fatigue analysis, and custom foundation engineering based on local soil bearing capacity. The swing mechanism integrates a 3HP heavy industrial worm-gearbox and 3-phase electric brake motor coupled to high-strength Usha Martin wire ropes and certified remote operating consoles.',
    safetySystems: 'Safety is paramount in Starline Giant Swing installations. The ride utilizes multi-redundant safety features including CE/EN certified multi-rider full-body harnesses, heavy-duty alloy steel carabiners with minimum 25 kN breaking strength, instantaneous mechanical quick-release locks, primary and secondary steel safety catch lines, and dual emergency stop interlocks.',
    process: 'Every Starline Giant Swing undergoes a comprehensive 6-stage manufacturing protocol: 1) Structural steel inspection and ultrasonic weld testing; 2) Precision fabrication and CNC drilling; 3) Blast cleaning and high-durability zinc-primer and PU coating; 4) Mechanical winch and motor integration; 5) Factory load testing of winch and release mechanisms; 6) Site delivery with turnkey civil anchor blueprints.',
    installation: 'Our certified engineering crew manages the complete on-site installation, including RCC footing supervision, crane erection of the structural A-frame, cable tensioning, remote console calibration, on-site proof load testing with calibrated dead weights (up to 1.5x working load limit), and comprehensive operational and rescue training for the client’s adventure staff.',
    applications: [
      'Commercial Adventure Parks & Theme Parks',
      'Destination Resorts & Luxury Camping Hubs',
      'Eco-Tourism Reserves & Hill Station Attractions',
      'Agro-Tourism Farms & Corporate Recreation Centers'
    ],
    faqs: [
      { q: 'What is a Giant Swing and how does it operate?', a: 'A Giant Swing is a high-altitude pendulum thrill attraction where 2 to 4 riders in certified harnesses are hoisted to heights of 40ft to 100ft by an automated electric winch before an instantaneous release drops them into a wide weightless swinging arc over scenic terrain.' },
      { q: 'Does Starline Adventures manufacture Giant Swings in India?', a: 'Yes, Starline Adventures is a direct manufacturer based in Nagpur, Maharashtra, fabricating Giant Swings in India using heavy IS 2062 structural steel and certified rigging hardware.' },
      { q: 'Does Starline provide complete on-site Giant Swing installation?', a: 'Yes. We offer turnkey services including site survey, structural foundation civil drawings, steel fabrication, on-site crane erection, rigging, proof load testing, and staff operational training across all states in India.' },
      { q: 'What information is required to plan a Giant Swing project?', a: 'To plan a project, we require your site dimensions, ground topography (flat ground, hill slope, or cliff edge), target rider capacity (2 to 4 seater), and intended operating height (40ft, 50ft, 60ft, 70ft, or 100ft).' },
      { q: 'Can the Giant Swing structure be customized?', a: 'Yes. We engineer customized tower heights, multi-seat configurations, branded color finishes, and terrain-specific foundation anchor systems tailored to your destination’s landscape.' },
      { q: 'What safety systems and certifications are used on the Giant Swing?', a: 'We employ dual redundant Usha Martin galvanized wire ropes, CE-certified multi-rider harnesses, rated alloy carabiners, quick-release locking hooks, emergency brake systems, and proof load testing compliant with international adventure safety standards.' },
      { q: 'How can I request a quotation for a Giant Swing?', a: 'You can submit your requirements through the quotation form on this page, email starlineadventure@gmail.com, or contact our engineering desk directly at +91-94249-04000.' }
    ]
  },
  'zip-line': {
    keyword: 'zipline manufacturer',
    seoTitle: 'Zipline Manufacturer in India | Starline Adventures',
    metaDesc: 'Starline Adventures is a premier Zipline manufacturer and installation company in India, delivering turnkey commercial ziplines with gravity and spring braking systems across resorts and adventure parks.',
    h1: 'Zipline Manufacturer in India',
    tagline: 'Precision-engineered commercial ziplines spanning 50m to 1000m+ across valleys, lakes, canopies, and adventure parks with failsafe braking and international safety compliance.',
    manufacturing: 'Starline Adventures manufactures turnkey commercial zipline systems comprising heavy-gauge structural steel launch and landing towers, precision-machined tandem stainless steel trolleys, certified tensioning hardware, and multi-stage impact deceleration spring buffers. All structural steel elements are hot-dip galvanized or treated with marine-grade anti-rust epoxy coatings.',
    engineering: 'Zipline engineering requires exact mathematical modeling of catenary curves, rider velocity profiles under varying wind and payload conditions, cable tension under dynamic sag, and terminal deceleration forces. We utilize high-tensile Usha Martin galvanized steel wire ropes engineered with safety factors exceeding 5:1.',
    safetySystems: 'Starline ziplines feature dual-point redundant rider attachment, dual-sheave sealed-bearing trolleys with backup tethers, progressive multi-stage compression spring braking stations, emergency arrest blocks, and CE/EN 12277 certified full-body and seat harnesses.',
    process: 'Our zipline development follows a structured methodology: topographical contour mapping and sag analysis, foundation engineering, tower fabrication, ultrasonic weld inspection, cable stringing with calibrated hydraulic tensioners, and multi-weight dynamic velocity trials.',
    installation: 'Our field engineers oversee turnkey installation including RCC anchor footings, tower rigging, wire rope tensioning, primary and secondary brake calibration, high-speed test runs with instrumented test dummies, and full operator rescue training.',
    applications: [
      'Hill Stations & Mountain Valley Resorts',
      'Lakeside & Coastal Eco-Tourism Parks',
      'Commercial Adventure Parks & Theme Hubs',
      'Forest Canopy Exploration Trails'
    ],
    faqs: [
      { q: 'Does Starline Adventures manufacture and install Ziplines in India?', a: 'Yes. Starline Adventures designs, manufactures, and installs turnkey commercial ziplines across India, ranging from 50-meter resort lines to 1000m+ long-span valley crossings.' },
      { q: 'What braking systems are implemented on Starline Ziplines?', a: 'We install multi-stage impact compression spring brakes, zip stopper deceleration systems, and emergency backup arrest cables to ensure smooth, safe landings for all rider weights.' },
      { q: 'What wire ropes are used for commercial zipline installations?', a: 'We exclusively use high-tensile galvanized steel wire ropes from certified manufacturers like Usha Martin (10mm to 16mm diameter) with minimum breaking strengths of 25 kN to 40 kN.' },
      { q: 'What terrain is required to install a commercial zipline?', a: 'Ziplines can be installed across flat ground with structural takeoff/landing towers, between natural hillside slopes, across river valleys, or over water bodies.' },
      { q: 'How long does a commercial zipline installation take?', a: 'Depending on span length and terrain, manufacturing and installation typically takes 3 to 6 weeks from foundation casting to final proof load testing and commissioning.' }
    ]
  },
  'ninja-rope-courses': {
    keyword: 'rope course manufacturer',
    seoTitle: 'Rope Course Manufacturer in India | Starline Adventures',
    metaDesc: 'Starline Adventures is a leading Rope Course manufacturer in India, building multi-level high and low rope obstacle courses with continuous lifeline safety systems for parks and resorts.',
    h1: 'Rope Course Manufacturer in India',
    tagline: 'Custom-designed multi-tier high and low rope obstacle courses engineered with continuous belay lifelines for maximum throughput and family adventure.',
    manufacturing: 'Starline Adventures manufactures modular high and low rope courses utilizing heavy structural steel support columns, seasoned weather-treated timber crossing elements, marine-grade synthetic cordage, and heavy galvanized wire ropes. Every challenge element—from Burma bridges to swinging planks and commando crawls—is built for industrial durability.',
    engineering: 'Our rope courses are engineered in strict compliance with EN 15567-1 and EN 15567-2 aerial adventure park standards. We calculate dynamic multi-user loads across single, double, and triple-tier structural configurations, ensuring continuous lifeline safety track stability under peak participant flow.',
    safetySystems: 'Equipped with continuous belay track systems where participants are hooked in at ground level and remain 100% securely attached until exiting the course. Features heavy-duty safety netting beneath elevated elements, CE-certified harnesses, and impact-absorbing helmets.',
    process: 'From conceptual 3D layout design and modular steel fabrication to anti-corrosive finishing, timber kiln-drying and preservative treatment, every component is pre-assembled and quality-checked at our Nagpur facility prior to site shipment.',
    installation: 'On-site installation includes structural column erection, tensioned cable rigging, obstacle element suspension, safety lifeline commissioning, proof load testing with certified weights, and staff guide training.',
    applications: [
      'Commercial Adventure Parks & Family Entertainment Centers',
      'Destination Resorts & Weekend Getaways',
      'Agro-Tourism & Nature Campuses',
      'Corporate Team-Building Facilities & Schools'
    ],
    faqs: [
      { q: 'What is the difference between high rope and low rope courses?', a: 'High rope courses are elevated 15ft to 40ft above ground requiring continuous lifeline belay systems and harnesses, whereas low rope courses are positioned 1ft to 3ft above ground focusing on team dynamics and ground-level balance.' },
      { q: 'Does Starline Adventures provide custom rope course designs?', a: 'Yes. We design modular courses with 10 to 40+ obstacle elements across 1, 2, or 3 elevated levels tailored to your site area and target participant throughput.' },
      { q: 'What continuous belay safety system is used?', a: 'We implement continuous safety lifeline systems conforming to EN 15567 standards where users cannot detach their safety connector during transit between obstacle platforms.' },
      { q: 'How many participants can use the rope course simultaneously?', a: 'Our multi-tier configurations are engineered for continuous flow accommodating 20 to 60+ participants per hour depending on the number of elements and tiers.' }
    ]
  },
  'wall-climbing': {
    keyword: 'climbing wall manufacturer',
    seoTitle: 'Climbing Wall Manufacturer in India | Starline Adventures',
    metaDesc: 'Starline Adventures is a premier Climbing Wall manufacturer in India, delivering outdoor and indoor artificial rock climbing walls, FRP panels, and auto-belay systems for adventure parks and gyms.',
    h1: 'Climbing Wall Manufacturer in India',
    tagline: 'Commercial artificial rock climbing walls, modular bouldering panels, and multi-lane speed walls manufactured with CE-certified auto-belay systems.',
    manufacturing: 'Starline manufactures artificial rock climbing walls featuring heavy structural steel lattice framework, 3D rock-textured fiber-reinforced polymer (FRP) panels, and high-density multiplex bouldering boards with dense M10 stainless steel T-nut grids and ergonomic polyurethane climbing holds.',
    engineering: 'Engineered to withstand heavy dynamic fall arrest forces and exterior wind loads compliant with EN 12572-1 standards. Structural calculation reports verify column deflection, anchor point pull-out resistance (exceeding 25 kN), and foundation shear factors.',
    safetySystems: 'Equipped with certified automatic auto-belay units, assisted-braking belay controllers, multi-directional top anchor stations, dynamic climbing ropes, and high-density safety drop-zone landing mats.',
    process: 'Design phase includes route setting and 3D panel geometry modeling, followed by precision steel truss fabrication, FRP surface texture application with UV-stabilized resins, modular hold setting, and proof load anchor testing.',
    installation: 'Turnkey on-site erection includes column foundation grouting, structural truss alignment, panel mounting, hold matrix installation, auto-belay testing, and belay certification training for activity operators.',
    applications: [
      'Adventure Parks & Tourism Resorts',
      'Commercial Climbing Gyms & Fitness Centers',
      'Schools, Colleges & Defense Training Academies',
      'Shopping Malls & Entertainment Arenas'
    ],
    faqs: [
      { q: 'What materials are used for Starline climbing walls?', a: 'We utilize structural mild steel framework with realistic rock-textured FRP panels or multiplex birch bouldering boards, fitted with polyurethane modular holds and grade 8.8 / 304 stainless steel hardware.' },
      { q: 'What heights can Starline climbing walls be built to?', a: 'Our walls range from 20ft beginner resort walls up to 50ft+ multi-lane speed climbing and lead climbing walls customized to your site specifications.' },
      { q: 'Are auto-belay devices available with the climbing wall?', a: 'Yes. We supply and integrate CE-certified hydraulic/magnetic auto-belay devices enabling solo climbers to ascend and descend safely without requiring a manual human belayer.' },
      { q: 'Can climbing walls be installed both indoors and outdoors?', a: 'Yes. We manufacture weather-resistant outdoor climbing structures with anti-corrosive coatings as well as compact indoor gym and bouldering walls.' }
    ]
  },
  'zip-bike-sky-cycle': {
    keyword: 'sky cycling manufacturer',
    seoTitle: 'Sky Cycling Manufacturer in India | Starline Adventures',
    metaDesc: 'Starline Adventures manufactures and installs commercial Sky Cycling and Zip Bike attractions in India with counterbalanced sports bicycles and redundant safety tethers.',
    h1: 'Sky Cycling Manufacturer in India',
    tagline: 'Thrilling aerial sky cycling rides allowing participants to pedal sports bicycles high above the ground on high-tension cables with complete self-balancing safety.',
    manufacturing: 'Starline Adventures manufactures commercial Zip Bike / Sky Cycling rides using high-tensile structural mild steel terminal towers, modified sports bicycles with precision cable guide wheels and low-friction sealed bearings, counterweight stabilizer keels, and redundant overhead safety lanyards.',
    engineering: 'Engineered with double-cable tracks (overhead guide line and lower load cable) tensioned via heavy-duty turnbuckles and Usha Martin wire ropes. Center-of-gravity stabilization ensures riders remain securely upright throughout the entire aerial circuit.',
    safetySystems: 'Includes dual overhead safety harness attachments, self-balancing counterweight keel, anti-derailment pulley guards, tandem guide wheels, and terminal impact buffer stoppers at both takeoff and landing decks.',
    process: 'Fabrication combines bicycle frame modification, CNC cable wheel machining, balance calibration, structural terminal tower fabrication, and factory track testing.',
    installation: 'Site installation comprises foundation anchor casting, terminal tower erection, cable tensioning with calibrated dynamometers, bicycle alignment, test rides with weight bags, and staff training.',
    applications: [
      'Resorts, Nature Parks & Scenic Hill Destinations',
      'Commercial Adventure Parks & Themed Attractions',
      'Agro-Tourism Farm Parks'
    ],
    faqs: [
      { q: 'How does Sky Cycling operate safely?', a: 'Riders pedal a modified sports bicycle suspended between high-tension wire ropes. A counterweight system beneath the bike combined with an overhead safety harness tether prevents tipping and ensures smooth, self-balancing movement.' },
      { q: 'What span lengths are typical for Sky Cycling?', a: 'Sky Cycling circuits typically range from 50m to 200m+ in single-lane, dual-lane, or reciprocal two-way configurations.' },
      { q: 'What is the rider weight limit for Sky Cycling?', a: 'The maximum recommended rider weight is 110 kg, suitable for ages 10 years and above.' }
    ]
  },
  'glass-bridge': {
    keyword: 'glass bridge manufacturer',
    seoTitle: 'Glass Bridge Manufacturer in India | Starline Adventures',
    metaDesc: 'Starline Adventures is a specialized Glass Bridge manufacturer and engineering contractor in India, designing suspended glass skywalks with laminated safety glass for tourism destinations.',
    h1: 'Glass Bridge Manufacturer in India',
    tagline: 'Spectacular suspended glass walkway skywalks engineered with multi-layer toughened laminated glass and heavy structural steel trusses for tourism landmarks.',
    manufacturing: 'Constructed with heavy-gauge structural steel trusses, multi-layer toughened laminated safety glass sandwich panels (SentryGlas interlayer), high-tensile stay wire ropes, and stainless steel marine-grade balustrades.',
    engineering: 'Structural design conforms to high wind-load simulations, seismic parameters, and heavy crowd live-load calculations (up to 500 kg/m²). Multiple redundant load paths ensure total stability.',
    safetySystems: 'Triple-layer laminated glass panels engineered such that even in the unlikely event of top glass damage, the structural interlayers maintain full load-bearing capacity without failure. Includes anti-slip surface treatments.',
    process: 'Full FEA stress analysis, precision steel truss fabrication, ultrasonic weld inspection, glass batch destructive load testing, and site anchor civil construction.',
    installation: 'Complete turnkey installation including hillside/rock anchor drilling, truss assembly, glass panel precision placement with silicone weather sealing, and proof load verification.',
    applications: [
      'Mountain & Valley Tourist Destinations',
      'Luxury Resorts & Cliff-Edge Viewpoints',
      'State Tourism & Iconic Landmark Projects'
    ],
    faqs: [
      { q: 'How safe is a commercial Glass Bridge?', a: 'Extremely safe. Starline glass bridges use triple-laminated toughened safety glass with high-strength structural interlayers and steel trusses designed for live loads exceeding 50 to 100+ visitors at once.' },
      { q: 'What spans can be engineered for a Glass Bridge?', a: 'We engineer spans from 20m scenic resort walkways to 150m+ high-altitude gorge crossings customized to site terrain.' }
    ]
  },
  'multi-activity-tower': {
    keyword: 'multi activity tower manufacturer',
    seoTitle: 'Multi Activity Tower Manufacturer in India | Starline Adventures',
    metaDesc: 'Starline Adventures manufactures turnkey Multi Activity Adventure Towers in India, consolidating wall climbing, rappelling, zipline launch, and quick jump into one compact steel hub.',
    h1: 'Multi Activity Tower Manufacturer in India',
    tagline: 'Centralized structural steel adventure hubs integrating 4 to 8 high-demand attractions in one space-efficient footprint for parks and resorts.',
    manufacturing: 'Fabricated with heavy IS 2062 structural steel lattice sections, modular multi-tier staging platforms, non-slip diamond steel decking, and perimeter fall-protection railings.',
    engineering: 'Multi-directional load calculations accommodate simultaneous dynamic forces from wall climbers, rappellers, and zipline launches while maintaining rigorous structural safety factors.',
    safetySystems: 'Certified multi-point anchor eyelets, continuous platform guardrails, self-closing safety gates, auto-belays, and CE-certified personal protective equipment.',
    process: 'Design, structural 3D modeling, precision column and platform fabrication, hot-dip galvanizing or epoxy painting, and comprehensive site anchor construction.',
    installation: 'Supervised RCC foundation casting, crane assembly of tower sections, platform decking attachment, activity rigging, and multi-user load testing.',
    applications: [
      'Resorts with Compact Land Acreage',
      'Commercial Adventure Parks & Camps',
      'Tourism Centers & Institutional Training Grounds'
    ],
    faqs: [
      { q: 'What activities can be integrated into an Adventure Tower?', a: 'A single tower can integrate Wall Climbing, Rappelling, Zipline Takeoff, Net Climbing, Quick Jump Freefall, and Rope Course connectors.' },
      { q: 'What heights are available for Multi Activity Towers?', a: 'Standard heights range from 35ft to 60ft with 2 to 4 intermediate activity staging decks.' }
    ]
  },
  'rocket-ejection': {
    keyword: 'rocket ejection ride manufacturer',
    seoTitle: 'Rocket Ejection Ride Manufacturer in India | Starline Adventures',
    metaDesc: 'Starline Adventures manufactures commercial Rocket Ejection and Reverse Bungee catapult rides in India with automated winches and high-tensile bungee systems.',
    h1: 'Rocket Ejection Ride Manufacturer in India',
    tagline: 'High-altitude twin-tower reverse bungee catapult launching riders skyward for extreme vertical acceleration and thrilling freefall thrills.',
    manufacturing: 'Manufactured with twin structural steel launch towers, 3-phase electric brake motor winches, industrial worm gearboxes, heavy-gauge multi-strand bungee cords, and remote operating consoles.',
    engineering: 'Engineered for dynamic tensioning and instantaneous mechanical ejection release, producing safe, calibrated g-forces and smooth weightless deceleration.',
    safetySystems: 'Dual redundant release hooks, full-body pilot harnesses, emergency power shutoff, mechanical fail-safe cable stops, and perimeter spectator containment railings.',
    process: 'Structural fabrication, motor drive calibration, tension testing of bungee cords, electrical safety interlock programming, and factory test launch cycles.',
    installation: 'RCC foundation installation, tower erection, winch and cable alignment, electronic console wiring, test launches with weighted ballast, and staff training.',
    applications: [
      'High-Thrill Commercial Adventure Parks',
      'Destination Tourism Resorts & Fun Zones'
    ],
    faqs: [
      { q: 'How high does the Rocket Ejection propel riders?', a: 'Depending on tower height and tension settings, riders are catapulted 30ft to 40ft+ vertically skyward.' },
      { q: 'What are the participant restrictions?', a: 'Recommended for ages 10 years and above with a maximum rider weight of 100 kg.' }
    ]
  }
};

// Generate rich content for all products
function getProductSEOData(product) {
  const slug = PRODUCT_SLUGS[product.id] || product.id.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const custom = PRODUCT_RICH_DATA[product.id] || {};

  const name = product.name;
  const isEquipment = (product.category === 'equipment') || product.id.includes('equipment') || product.id.includes('nets') || product.id.includes('harness') || product.id.includes('cables') || product.id.includes('hardware');

  const actionVerb = isEquipment ? 'Manufacturer & Supplier' : 'Manufacturer';
  const roleTerm = isEquipment ? 'Manufacturer & Equipment Supplier' : 'Manufacturer';

  const seoTitle = custom.seoTitle || `${name} ${actionVerb} in India | Starline Adventures`;
  const metaDesc = custom.metaDesc || `Starline Adventures is a trusted ${name} ${actionVerb.toLowerCase()} in India, delivering commercial certified adventure park solutions with turnkey engineering and installation.`;
  const h1 = custom.h1 || `${name} ${roleTerm} in India`;
  const tagline = custom.tagline || (product.shortDesc ? `${product.shortDesc} Precision-manufactured in India by Starline Adventures with certified safety compliance and turnkey installation.` : `Commercial grade ${name.toLowerCase()} engineered and installed across India by Starline Adventures.`);

  const manufacturing = custom.manufacturing || `Starline Adventures manufactures high-grade ${name.toLowerCase()} using industrial structural steel (IS 2062), certified hardware, and anti-corrosive protective coatings. Every component is fabricated in our dedicated manufacturing facility under rigorous quality control standards to withstand extreme outdoor weather conditions and heavy commercial guest throughput.`;
  const engineering = custom.engineering || `Our engineering methodology for ${name.toLowerCase()} encompasses detailed structural calculations, load-bearing stress evaluations, and adherence to relevant national and international safety codes. We design custom mounting and foundational interfaces tailored to each client's specific site topography and operational requirements.`;
  const safetySystems = custom.safetySystems || `Safety is engineered into every component of our ${name.toLowerCase()}. We incorporate redundant load paths, certified safety connectors, CE-compliant harness and cable interfaces, and multi-point proof load testing to ensure complete operational reliability.`;
  const process = custom.process || `Our end-to-end manufacturing process covers material certification, precision cutting and welding, protective multi-coat surface finishing, mechanical assembly inspection, factory proof load testing, and comprehensive pre-dispatch verification.`;
  const installation = custom.installation || `Starline Adventures provides complete turnkey installation across India. Our experienced field engineers manage foundation preparation, structural erection, cable and hardware rigging, mechanical commissioning, live load safety testing, and staff operational training.`;

  const applications = custom.applications || [
    'Commercial Adventure Parks & Theme Hubs',
    'Destination Resorts & Weekend Retreats',
    'Eco-Tourism Zones & Nature Trails',
    'Agro-Tourism Farms & Recreation Spaces'
  ];

  const projects = GENUINE_PROJECTS[product.id] || DEFAULT_PROJECTS;

  const faqs = custom.faqs || [
    {
      q: `Does Starline Adventures manufacture and supply ${name} in India?`,
      a: `Yes, Starline Adventures manufactures, supplies, and installs ${name} across India from our primary manufacturing base in Nagpur, Maharashtra.`
    },
    {
      q: `What safety standards and materials are used for ${name}?`,
      a: `We utilize heavy-gauge structural steel, CE and IS compliant hardware, anti-corrosive weather coatings, and proof load testing to ensure maximum safety and durability.`
    },
    {
      q: `Can ${name} be customized for our site?`,
      a: `Yes. Starline Adventures engineers custom dimensions, layout configurations, and color finishes to suit your specific terrain and visitor capacity.`
    },
    {
      q: `Does Starline provide turnkey installation across India?`,
      a: `Yes. We provide complete turnkey services including site assessment, foundation drawings, structural delivery, on-site assembly, load certification, and staff training.`
    },
    {
      q: `How can I request a quotation for ${name}?`,
      a: `You can fill out the quotation form on this page, call our engineering team at +91-94249-04000, or message us on WhatsApp for immediate technical assistance.`
    }
  ];

  return {
    slug,
    name,
    seoTitle,
    metaDesc,
    h1,
    tagline,
    manufacturing,
    engineering,
    safetySystems,
    process,
    installation,
    applications,
    projects,
    faqs,
    isEquipment
  };
}

// Generate the complete HTML page for a product
function generateProductHtml(product, seo, allProducts) {
  const canonicalUrl = `https://starlineadventures.com/${seo.slug}/`;
  const categoryLabel = seo.isEquipment ? 'Adventure Equipment' : 'Adventure Rides';
  const categoryHref = seo.isEquipment ? '/products.html#equipment' : '/products.html#activities';

  // Format specs HTML
  let specsHtml = '';
  if (product.specs && product.specs.length > 0) {
    product.specs.forEach(spec => {
      specsHtml += `
        <tr>
          <th>${escapeHtml(spec.label)}</th>
          <td>${escapeHtml(spec.value)}</td>
        </tr>`;
    });
  } else {
    specsHtml = `
      <tr>
        <th>Technical Specifications</th>
        <td>Contact Starline Adventures engineering team for project-specific structural drawings and custom specifications.</td>
      </tr>`;
  }

  // Format FAQs HTML & JSON-LD
  let faqsHtml = '';
  const faqLdElements = [];
  seo.faqs.forEach((faq, idx) => {
    faqsHtml += `
      <div class="seo-faq-item">
        <h3 class="seo-faq-question">${escapeHtml(faq.q)}</h3>
        <div class="seo-faq-answer"><p>${escapeHtml(faq.a)}</p></div>
      </div>`;
    faqLdElements.push({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    });
  });

  // Format Projects HTML
  let projectsHtml = '';
  seo.projects.forEach(proj => {
    projectsHtml += `
      <div class="seo-project-card">
        <div class="seo-project-badge">Verified Installation</div>
        <h3 class="seo-project-name">${escapeHtml(proj.name)}</h3>
        <p class="seo-project-loc">📍 ${escapeHtml(proj.location)}</p>
        <p class="seo-project-desc">${escapeHtml(proj.scope)}</p>
      </div>`;
  });

  // Format Applications HTML
  let appsHtml = '';
  seo.applications.forEach(app => {
    appsHtml += `
      <div class="seo-app-item">
        <span class="seo-app-icon" aria-hidden="true">✔</span>
        <span>${escapeHtml(app)}</span>
      </div>`;
  });

  // Related products (select 3 other products with clean links)
  const related = allProducts.filter(p => p.id !== product.id).slice(0, 3);
  let relatedHtml = '';
  related.forEach(rel => {
    const relSlug = PRODUCT_SLUGS[rel.id] || rel.id;
    const relImg = rel.image ? `<img src="/${rel.image}" alt="${escapeHtml(rel.name)} - Starline Adventures" class="product-item-img" loading="lazy" decoding="async">` : `<div class="product-card-empty-box"><span class="product-card-empty-icon" aria-hidden="true">📷</span><span class="product-card-empty-text">Starline Adventures</span></div>`;
    relatedHtml += `
      <article class="product-item-card">
        <div class="product-item-img-wrap">
          ${relImg}
        </div>
        <div class="product-item-body">
          <h3 class="product-item-title">${escapeHtml(rel.name)}</h3>
          <p class="product-item-desc">${escapeHtml(rel.shortDesc || '')}</p>
          <div class="product-item-actions">
            <a href="/${relSlug}/" class="btn-product-info">View Details</a>
            <button type="button" class="btn-product-enquire" onclick="openProductEnquiryModal('${escapeHtml(rel.name)}')">Request Quote</button>
          </div>
        </div>
      </article>`;
  });

  // Product Image or placeholder
  const mainImgHtml = (product.image && product.image.trim() !== '')
    ? `<img src="/${product.image}" alt="${escapeHtml(product.name)} manufactured and installed by Starline Adventures in India" class="seo-main-img" fetchpriority="high">`
    : `<div class="seo-placeholder-box"><span class="seo-placeholder-icon" aria-hidden="true">📷</span><p class="seo-placeholder-text">${escapeHtml(product.name)}</p><p class="seo-placeholder-sub">Engineered &amp; Installed by Starline Adventures</p></div>`;

  // Breadcrumbs Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://starlineadventures.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": categoryLabel,
        "item": `https://starlineadventures.com${categoryHref}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${product.name} Manufacturer`,
        "item": canonicalUrl
      }
    ]
  };

  // Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${product.name} - Commercial Adventure Attraction`,
    "description": seo.metaDesc,
    "image": product.image ? `https://starlineadventures.com/${product.image}` : "https://starlineadventures.com/images/logo.jpeg",
    "brand": {
      "@type": "Brand",
      "name": "Starline Adventures"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "Starline Adventures Pvt Ltd",
      "url": "https://starlineadventures.com/",
      "logo": "https://starlineadventures.com/images/logo.jpeg",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Opposite Government Guest House, Saraswati Nagar, Laxmi Nagar",
        "addressLocality": "Nagpur",
        "addressRegion": "Maharashtra",
        "postalCode": "441302",
        "addressCountry": "IN"
      }
    },
    "category": categoryLabel,
    "url": canonicalUrl
  };

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqLdElements
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(seo.seoTitle)}</title>
    <meta name="description" content="${escapeHtml(seo.metaDesc)}">
    <meta name="robots" content="index, follow">
    <meta name="author" content="Starline Adventures Pvt Ltd">
    <meta name="theme-color" content="#F47621">
    <link rel="canonical" href="${canonicalUrl}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Starline Adventures Pvt Ltd">
    <meta property="og:title" content="${escapeHtml(seo.seoTitle)}">
    <meta property="og:description" content="${escapeHtml(seo.metaDesc)}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:image" content="${product.image ? `https://starlineadventures.com/${product.image}` : 'https://starlineadventures.com/images/logo.jpeg'}">
    <meta property="og:image:alt" content="${escapeHtml(product.name)} manufactured and installed by Starline Adventures in India">

    <!-- Twitter / X Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(seo.seoTitle)}">
    <meta name="twitter:description" content="${escapeHtml(seo.metaDesc)}">
    <meta name="twitter:image" content="${product.image ? `https://starlineadventures.com/${product.image}` : 'https://starlineadventures.com/images/logo.jpeg'}">
    <meta name="twitter:image:alt" content="${escapeHtml(product.name)} manufactured and installed by Starline Adventures in India">

    <!-- Favicon -->
    <link rel="icon" type="image/jpeg" href="/images/logo.jpeg">
    <link rel="apple-touch-icon" href="/images/logo.jpeg">

    <!-- Schema.org Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(breadcrumbSchema, null, 2)}
    </script>
    <script type="application/ld+json">
    ${JSON.stringify(productSchema, null, 2)}
    </script>
    <script type="application/ld+json">
    ${JSON.stringify(faqSchema, null, 2)}
    </script>

    <!-- Fonts & CSS -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="/css/style.css">
    <script src="/js/config.js" defer></script>

    <style>
        .seo-product-hero {
            background: linear-gradient(135deg, #0b192c 0%, #1e293b 100%);
            color: #ffffff;
            padding: 48px 0 42px;
            position: relative;
        }
        .seo-breadcrumbs {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.88rem;
            color: #94a3b8;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }
        .seo-breadcrumbs a {
            color: #cbd5e1;
            text-decoration: none;
            transition: color 0.2s;
        }
        .seo-breadcrumbs a:hover {
            color: #f47621;
        }
        .seo-breadcrumbs-separator {
            color: #64748b;
        }
        .seo-breadcrumbs-current {
            color: #f47621;
            font-weight: 600;
        }
        .seo-product-hero h1 {
            font-size: clamp(2rem, 3.8vw, 2.75rem);
            font-weight: 800;
            color: #ffffff;
            margin: 0 0 12px;
            line-height: 1.2;
        }
        .seo-product-hero p {
            font-size: 1.08rem;
            color: #cbd5e1;
            max-width: 820px;
            line-height: 1.6;
            margin: 0;
        }
        .seo-layout-grid {
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: 40px;
            margin: 40px 0 60px;
            align-items: start;
        }
        .seo-main-article {
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            padding: 36px;
            box-shadow: 0 4px 20px rgba(11, 25, 44, 0.04);
        }
        .seo-image-container {
            width: 100%;
            height: 420px;
            border-radius: 14px;
            overflow: hidden;
            background: #f1f5f9;
            margin-bottom: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e2e8f0;
        }
        .seo-main-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .seo-placeholder-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 40px 20px;
            width: 100%;
            height: 100%;
            background: linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%);
            color: #64748b;
        }
        .seo-placeholder-icon {
            font-size: 3rem;
            margin-bottom: 12px;
            opacity: 0.6;
        }
        .seo-placeholder-text {
            font-weight: 700;
            font-size: 1.2rem;
            color: #1e293b;
            margin: 0 0 4px;
        }
        .seo-placeholder-sub {
            font-size: 0.9rem;
            color: #64748b;
            margin: 0;
        }
        .seo-section-h2 {
            font-size: 1.55rem;
            font-weight: 800;
            color: #0b192c;
            margin: 36px 0 16px;
            position: relative;
            padding-bottom: 10px;
        }
        .seo-section-h2:first-of-type {
            margin-top: 0;
        }
        .seo-section-h2::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            width: 52px;
            height: 3px;
            background: #f47621;
            border-radius: 2px;
        }
        .seo-prose-text {
            font-size: 1.02rem;
            line-height: 1.75;
            color: #334155;
            margin-bottom: 24px;
        }
        .seo-specs-table-wrap {
            overflow-x: auto;
            margin: 20px 0 32px;
        }
        .seo-specs-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
        }
        .seo-specs-table tr {
            border-bottom: 1px solid #e2e8f0;
        }
        .seo-specs-table tr:last-child {
            border-bottom: none;
        }
        .seo-specs-table th {
            width: 32%;
            background: #f8fafc;
            color: #334155;
            font-weight: 700;
            padding: 14px 18px;
            text-align: left;
            font-size: 0.92rem;
            border-right: 1px solid #e2e8f0;
        }
        .seo-specs-table td {
            padding: 14px 18px;
            color: #0b192c;
            font-size: 0.95rem;
            line-height: 1.5;
            font-weight: 500;
        }
        .seo-projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }
        .seo-project-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 18px 20px;
        }
        .seo-project-badge {
            display: inline-block;
            background: rgba(244, 118, 33, 0.12);
            color: #f47621;
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 3px 8px;
            border-radius: 4px;
            margin-bottom: 8px;
        }
        .seo-project-name {
            font-size: 1.05rem;
            font-weight: 700;
            color: #0b192c;
            margin: 0 0 4px;
        }
        .seo-project-loc {
            font-size: 0.86rem;
            color: #64748b;
            font-weight: 600;
            margin: 0 0 8px;
        }
        .seo-project-desc {
            font-size: 0.88rem;
            color: #334155;
            line-height: 1.45;
            margin: 0;
        }
        .seo-apps-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 32px;
        }
        .seo-app-item {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.92rem;
            font-weight: 600;
            color: #1e293b;
        }
        .seo-app-icon {
            color: #16a34a;
            font-weight: 800;
        }
        .seo-faq-list {
            margin-bottom: 24px;
        }
        .seo-faq-item {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 18px 22px;
            margin-bottom: 12px;
            background: #f8fafc;
        }
        .seo-faq-question {
            font-size: 1.08rem;
            font-weight: 700;
            color: #0b192c;
            margin: 0 0 8px;
        }
        .seo-faq-answer p {
            font-size: 0.96rem;
            line-height: 1.6;
            color: #334155;
            margin: 0;
        }
        .seo-sidebar-card {
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            padding: 28px 24px;
            box-shadow: 0 4px 20px rgba(11, 25, 44, 0.05);
            position: sticky;
            top: 24px;
        }
        .seo-sidebar-title {
            font-size: 1.25rem;
            font-weight: 800;
            color: #0b192c;
            margin: 0 0 6px;
        }
        .seo-sidebar-sub {
            font-size: 0.88rem;
            color: #64748b;
            margin: 0 0 20px;
            line-height: 1.4;
        }
        .seo-direct-contact {
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .seo-direct-item {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
            color: #0b192c;
            font-weight: 600;
            font-size: 0.92rem;
            padding: 10px 14px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            transition: all 0.2s;
        }
        .seo-direct-item:hover {
            border-color: #f47621;
            background: #fff8f3;
            color: #f47621;
        }
        .seo-related-section {
            background: #f8fafc;
            padding: 60px 0;
            border-top: 1px solid #e2e8f0;
        }
        @media (max-width: 960px) {
            .seo-layout-grid {
                grid-template-columns: 1fr;
            }
            .seo-image-container {
                height: 320px;
            }
            .seo-apps-grid {
                grid-template-columns: 1fr;
            }
        }
        @media (max-width: 640px) {
            .seo-main-article {
                padding: 20px;
            }
            .seo-image-container {
                height: 240px;
            }
            .seo-specs-table th {
                width: 40%;
                padding: 10px 12px;
                font-size: 0.85rem;
            }
            .seo-specs-table td {
                padding: 10px 12px;
                font-size: 0.88rem;
            }
        }
    </style>
</head>
<body>

    <!-- TOP INFO BAR -->
    <div class="top-info-bar">
        <div class="container">
            <div class="top-info-content">
                <div class="top-info-section">
                    <span class="top-info-icon" aria-hidden="true">📍</span>
                    <span>Nagpur, Maharashtra, India</span>
                </div>
                <div class="top-info-contact">
                    <div class="top-info-section">
                        <span class="top-info-icon" aria-hidden="true">📞</span>
                        <a href="tel:+919424904000">+91-94249-04000</a>
                    </div>
                    <div class="top-info-section">
                        <span class="top-info-icon" aria-hidden="true">📧</span>
                        <a href="mailto:starlineadventure@gmail.com">starlineadventure@gmail.com</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- MAIN HEADER -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <a href="/index.html" class="logo" aria-label="Starline Adventures Home">
                    <img src="/images/logo.jpeg" alt="STARLINE ADVENTURES PVT LTD" decoding="async">
                </a>
                <button class="hamburger" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="primary-navigation">
                    <span></span><span></span><span></span>
                </button>
                <nav class="nav-menu" id="primary-navigation" aria-label="Primary Navigation">
                    <a href="/index.html">Home</a>
                    <a href="/about.html">About</a>
                    <div class="nav-dropdown">
                        <button class="nav-dropdown-toggle" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="products-navigation">
                            Products <span class="nav-arrow" aria-hidden="true">&#9662;</span>
                        </button>
                        <div class="nav-dropdown-menu" id="products-navigation">
                            <a href="/products.html">All Products</a>
                            <a href="/products.html#activities">Activities</a>
                            <a href="/products.html#equipment">Equipment</a>
                        </div>
                    </div>
                    <div class="nav-dropdown">
                        <button class="nav-dropdown-toggle" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="portfolio-navigation">
                            Projects <span class="nav-arrow" aria-hidden="true">&#9662;</span>
                        </button>
                        <div class="nav-dropdown-menu" id="portfolio-navigation">
                            <a href="/portfolio.html">All Projects</a>
                            <a href="/gallery.html">Gallery</a>
                        </div>
                    </div>
                    <a href="/team.html">Team</a>
                    <a href="/testimonials.html">Testimonials</a>
                    <a href="/contact.html">Contact</a>
                    <a href="/contact.html" class="nav-cta-btn">Get a Quote</a>
                </nav>
            </div>
        </div>
    </header>
    <div class="nav-backdrop" aria-hidden="true"></div>

    <main id="main-content">
        <!-- Hero & Breadcrumb Section -->
        <section class="seo-product-hero">
            <div class="container">
                <nav class="seo-breadcrumbs" aria-label="Breadcrumb">
                    <a href="/index.html">Home</a>
                    <span class="seo-breadcrumbs-separator">/</span>
                    <a href="${categoryHref}">${escapeHtml(categoryLabel)}</a>
                    <span class="seo-breadcrumbs-separator">/</span>
                    <span class="seo-breadcrumbs-current">${escapeHtml(product.name)}</span>
                </nav>
                <h1>${escapeHtml(seo.h1)}</h1>
                <p>${escapeHtml(seo.tagline)}</p>
            </div>
        </section>

        <!-- Main Content Grid -->
        <div class="container">
            <div class="seo-layout-grid">
                
                <!-- Main Article -->
                <article class="seo-main-article">
                    <div class="seo-image-container">
                        ${mainImgHtml}
                    </div>

                    <h2 class="seo-section-h2">${escapeHtml(product.name)} Manufacturing &amp; Installation</h2>
                    <p class="seo-prose-text">${escapeHtml(seo.manufacturing)}</p>

                    <h2 class="seo-section-h2">${escapeHtml(product.name)} Design &amp; Engineering</h2>
                    <p class="seo-prose-text">${escapeHtml(seo.engineering)}</p>

                    <h2 class="seo-section-h2">Technical Specifications</h2>
                    <p class="seo-prose-text">Detailed mechanical, structural, and operational parameters for ${escapeHtml(product.name)} as manufactured by Starline Adventures:</p>
                    <div class="seo-specs-table-wrap">
                        <table class="seo-specs-table">
                            ${specsHtml}
                        </table>
                    </div>

                    <h2 class="seo-section-h2">${escapeHtml(product.name)} Safety Systems</h2>
                    <p class="seo-prose-text">${escapeHtml(seo.safetySystems)}</p>

                    <h2 class="seo-section-h2">Manufacturing Process</h2>
                    <p class="seo-prose-text">${escapeHtml(seo.process)}</p>

                    <h2 class="seo-section-h2">Installation &amp; Commissioning</h2>
                    <p class="seo-prose-text">${escapeHtml(seo.installation)}</p>

                    <h2 class="seo-section-h2">${escapeHtml(product.name)} Projects</h2>
                    <p class="seo-prose-text">Starline Adventures has manufactured and installed adventure infrastructure across leading resorts, wildlife reserves, and tourism parks throughout India:</p>
                    <div class="seo-projects-grid">
                        ${projectsHtml}
                    </div>

                    <h2 class="seo-section-h2">Applications</h2>
                    <p class="seo-prose-text">Our commercial ${escapeHtml(product.name.toLowerCase())} is ideally suited for diverse commercial leisure and recreation environments:</p>
                    <div class="seo-apps-grid">
                        ${appsHtml}
                    </div>

                    <h2 class="seo-section-h2">Frequently Asked Questions</h2>
                    <div class="seo-faq-list">
                        ${faqsHtml}
                    </div>
                </article>

                <!-- Sidebar Quote Card -->
                <aside class="seo-sidebar-card">
                    <h3 class="seo-sidebar-title">Request a Custom Quote</h3>
                    <p class="seo-sidebar-sub">Direct factory pricing, customized site drawings, and turnkey installation from Starline Adventures.</p>

                    <form id="sidebarProductEnquiryForm" action="/api/enquiry" method="POST" class="enquiry-form">
                        <input type="hidden" name="formType" value="Product Page RFQ - ${escapeHtml(product.name)}">

                        <div style="margin-bottom: 14px;">
                            <label for="detailEnquiryProduct" style="display: block; font-size: 0.85rem; font-weight: 700; color: #0b192c; margin-bottom: 6px;">Product / Attraction</label>
                            <input type="text" id="detailEnquiryProduct" name="product" value="${escapeHtml(product.name)}" readonly required style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f1f5f9; font-weight: 700; color: #0b192c; box-sizing: border-box;">
                        </div>

                        <div style="margin-bottom: 14px;">
                            <label for="detailEnquiryName" style="display: block; font-size: 0.85rem; font-weight: 600; color: #0b192c; margin-bottom: 6px;">Full Name *</label>
                            <input type="text" id="detailEnquiryName" name="name" required placeholder="Your full name" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;">
                        </div>

                        <div style="margin-bottom: 14px;">
                            <label for="detailEnquiryPhone" style="display: block; font-size: 0.85rem; font-weight: 600; color: #0b192c; margin-bottom: 6px;">Phone Number *</label>
                            <input type="tel" id="detailEnquiryPhone" name="phone" required placeholder="+91-94249-04000" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;">
                        </div>

                        <div style="margin-bottom: 14px;">
                            <label for="detailEnquiryEmail" style="display: block; font-size: 0.85rem; font-weight: 600; color: #0b192c; margin-bottom: 6px;">Email Address *</label>
                            <input type="email" id="detailEnquiryEmail" name="email" required placeholder="you@example.com" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;">
                        </div>

                        <div style="margin-bottom: 14px;">
                            <label for="detailEnquiryLocation" style="display: block; font-size: 0.85rem; font-weight: 600; color: #0b192c; margin-bottom: 6px;">Project Location *</label>
                            <input type="text" id="detailEnquiryLocation" name="location" required placeholder="City, State" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;">
                        </div>

                        <div style="margin-bottom: 18px;">
                            <label for="detailEnquiryMessage" style="display: block; font-size: 0.85rem; font-weight: 600; color: #0b192c; margin-bottom: 6px;">Project Requirements *</label>
                            <textarea id="detailEnquiryMessage" name="message" rows="3" required placeholder="Describe your site area, target riders, timeline..." style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; resize: vertical; font-family: inherit;"></textarea>
                        </div>

                        <button type="submit" class="btn btn-product-enquire" style="width: 100%; padding: 12px; font-size: 1rem;">Submit Enquiry <span aria-hidden="true">&rarr;</span></button>
                        <p class="form-status" role="status" aria-live="polite" style="margin-top: 12px;"></p>
                    </form>

                    <div class="seo-direct-contact">
                        <a href="https://wa.me/919424904000?text=${encodeURIComponent(`Hello Starline Adventures, I would like to request technical details and a quote for ${product.name}.`)}" target="_blank" rel="noopener noreferrer" class="seo-direct-item">
                            <span style="font-size: 1.25rem;">💬</span>
                            <span>Chat on WhatsApp</span>
                        </a>
                        <a href="tel:+919424904000" class="seo-direct-item">
                            <span style="font-size: 1.25rem;">📞</span>
                            <span>Call +91-94249-04000</span>
                        </a>
                    </div>
                </aside>
            </div>
        </div>

        <!-- Related Popular Rides / Equipment Section -->
        <section class="seo-related-section">
            <div class="container">
                <div class="section-heading" style="text-align: center; margin-bottom: 36px;">
                    <p class="section-eyebrow">EXPLORE MORE</p>
                    <h2 style="font-size: 2rem; color: #0b192c; font-weight: 800; margin-bottom: 8px;">Explore More Adventure Rides &amp; Equipment</h2>
                    <p style="color: #64748b;">Browse more commercial attractions engineered by Starline Adventures across India.</p>
                </div>
                <div class="products-grid-container">
                    ${relatedHtml}
                </div>
                <div style="text-align: center; margin-top: 36px;">
                    <a href="/products.html" class="btn btn-primary">View All Products &rarr;</a>
                </div>
            </div>
        </section>
    </main>

    <!-- FOOTER -->
    <footer class="footer" id="site-footer">
        <div class="container">
            <div class="footer-top">
                <div class="footer-brand">
                    <h3 class="footer-brand-name">STARLINE ADVENTURES PVT LTD</h3>
                    <p class="footer-brand-sub">Adventure Ride Manufacturer &amp; Installation</p>
                    <p class="footer-brand-desc">Manufacturing, supplying and installing certified adventure rides, activity towers, and equipment across India.</p>
                    <div class="footer-quote-wrap">
                        <a href="/contact.html" class="btn-footer-quote">
                            Request a Quote <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>
                </div>

                <div class="footer-columns">
                    <nav class="footer-column" aria-label="Company Links">
                        <h3 class="footer-title">COMPANY</h3>
                        <ul class="footer-links-list">
                            <li><a href="/about.html">About Us</a></li>
                            <li><a href="/portfolio.html">Projects</a></li>
                            <li><a href="/gallery.html">Gallery</a></li>
                            <li><a href="/team.html">Team</a></li>
                        </ul>
                    </nav>

                    <nav class="footer-column" aria-label="Product Categories">
                        <h3 class="footer-title">PRODUCTS</h3>
                        <ul class="footer-links-list">
                            <li><a href="/products.html#activities">Activities</a></li>
                            <li><a href="/products.html#equipment">Equipment</a></li>
                            <li><a href="/giant-swing-manufacturer/">Giant Swing</a></li>
                            <li><a href="/zipline-manufacturer/">Zipline</a></li>
                            <li><a href="/rope-course-manufacturer/">Rope Course</a></li>
                            <li><a href="/climbing-wall-manufacturer/">Climbing Wall</a></li>
                        </ul>
                    </nav>

                    <nav class="footer-column" aria-label="Quick Links">
                        <h3 class="footer-title">QUICK LINKS</h3>
                        <ul class="footer-links-list">
                            <li><a href="/index.html">Home</a></li>
                            <li><a href="/products.html">All Products</a></li>
                            <li><a href="/portfolio.html">Projects</a></li>
                            <li><a href="/contact.html">Contact</a></li>
                        </ul>
                    </nav>

                    <div class="footer-column footer-contact-col">
                        <h3 class="footer-title">CONTACT</h3>
                        <ul class="footer-contact-info">
                            <li>
                                <a href="tel:+919424904000" class="footer-contact-link">
                                    <span class="footer-icon" aria-hidden="true">📞</span>
                                    <span>+91-94249-04000 / +91-9421-244-244</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://wa.me/919424904000?text=${encodeURIComponent(`Hello Starline Adventures, I would like to discuss ${product.name}.`)}" target="_blank" rel="noopener noreferrer" class="footer-contact-link footer-wa-link">
                                    <span class="footer-icon" aria-hidden="true">💬</span>
                                    <span>Chat on WhatsApp</span>
                                </a>
                            </li>
                            <li>
                                <a href="mailto:starlineadventure@gmail.com" class="footer-contact-link">
                                    <span class="footer-icon" aria-hidden="true">✉️</span>
                                    <span>starlineadventure@gmail.com</span>
                                </a>
                            </li>
                            <li class="footer-location-text">
                                <span class="footer-icon" aria-hidden="true">📍</span>
                                <span>Opposite Government Guest House, Saraswati Nagar, Laxmi Nagar, Nagpur – 441302, Maharashtra, India</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <p class="footer-copyright">&copy; 2026 Starline Adventures Pvt Ltd. All Rights Reserved.</p>
                <div class="footer-social-links">
                    <a href="https://www.facebook.com/starlineadventures" target="_blank" rel="noopener noreferrer" aria-label="Starline Adventures Facebook" title="Facebook"><span class="footer-social-icon" aria-hidden="true">f</span></a>
                    <a href="https://www.instagram.com/starlineadventures" target="_blank" rel="noopener noreferrer" aria-label="Starline Adventures Instagram" title="Instagram"><span class="footer-social-icon" aria-hidden="true">📷</span></a>
                    <a href="https://www.youtube.com/@starlineadventures" target="_blank" rel="noopener noreferrer" aria-label="Starline Adventures YouTube" title="YouTube"><span class="footer-social-icon" aria-hidden="true">▶</span></a>
                    <a href="https://www.linkedin.com/company/starlineadventures" target="_blank" rel="noopener noreferrer" aria-label="Starline Adventures LinkedIn" title="LinkedIn"><span class="footer-social-icon" aria-hidden="true">in</span></a>
                </div>
            </div>
        </div>
    </footer>

    <!-- WhatsApp Floating Button -->
    <a href="https://wa.me/919424904000?text=${encodeURIComponent(`Hello Starline Adventures, I am interested in ${product.name}.`)}" class="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" title="Chat on WhatsApp">
        <span aria-hidden="true">💬</span>
    </a>

    <!-- Scripts -->
    <script src="/js/script.js"></script>
    <script>
        // Simple enquiry submission handler for this page
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('sidebarProductEnquiryForm');
            if (!form) return;
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                const statusEl = form.querySelector('.form-status');
                const submitBtn = form.querySelector('button[type="submit"]');

                const name = document.getElementById('detailEnquiryName').value.trim();
                const email = document.getElementById('detailEnquiryEmail').value.trim();
                const phone = document.getElementById('detailEnquiryPhone').value.trim();
                const location = document.getElementById('detailEnquiryLocation').value.trim();
                const product = document.getElementById('detailEnquiryProduct').value.trim();
                const message = document.getElementById('detailEnquiryMessage').value.trim();

                if (!name || !email || !phone || !location || !message) {
                    if (statusEl) {
                        statusEl.className = 'form-status error';
                        statusEl.textContent = '❌ Please fill in all required fields.';
                    }
                    return;
                }

                if (statusEl) {
                    statusEl.className = 'form-status loading';
                    statusEl.textContent = '⏳ Sending enquiry to engineering team...';
                }
                if (submitBtn) submitBtn.disabled = true;

                try {
                    const res = await fetch('/api/enquiry', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({
                            name, email, phone, location, product, message,
                            formType: 'Product Page RFQ'
                        })
                    });
                    const data = await res.json();
                    if (res.ok && data.ok !== false) {
                        form.reset();
                        if (statusEl) {
                            statusEl.className = 'form-status success';
                            statusEl.textContent = '✅ ' + (data.message || 'Thank you! Your enquiry has been received.');
                        }
                    } else {
                        throw new Error(data.error || 'Submission failed.');
                    }
                } catch (err) {
                    if (statusEl) {
                        statusEl.className = 'form-status error';
                        statusEl.textContent = '❌ ' + (err.message || 'Submission failed. Please call +91-94249-04000.');
                    }
                } finally {
                    if (submitBtn) submitBtn.disabled = false;
                }
            });
        });
    </script>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Generate all 34 product directories and pages
console.log("Generating static SEO product pages...");
const generatedUrls = [];

STARLINE_PRODUCTS.forEach(product => {
  const seo = getProductSEOData(product);
  const dirPath = path.join(__dirname, seo.slug);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const htmlContent = generateProductHtml(product, seo, STARLINE_PRODUCTS);
  const filePath = path.join(dirPath, 'index.html');
  fs.writeFileSync(filePath, htmlContent, 'utf8');

  console.log(`Generated: /${seo.slug}/ (Title: "${seo.seoTitle}", H1: "${seo.h1}")`);
  generatedUrls.push({
    slug: seo.slug,
    url: `https://starlineadventures.com/${seo.slug}/`,
    name: product.name,
    title: seo.seoTitle,
    h1: seo.h1
  });
});

// Generate 404.html
console.log("Generating 404.html...");
const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found (404) | Starline Adventures</title>
    <meta name="description" content="The page you are looking for does not exist or has been moved. Explore Starline Adventures commercial adventure rides and park equipment.">
    <meta name="robots" content="noindex, follow">
    <link rel="icon" type="image/jpeg" href="/images/logo.jpeg">
    <link rel="stylesheet" href="/css/style.css">
    <style>
        .error-page-wrap {
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 80px 20px;
            background: #f8fafc;
        }
        .error-card {
            max-width: 640px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 48px 36px;
            box-shadow: 0 4px 24px rgba(11, 25, 44, 0.06);
        }
        .error-code {
            font-size: 5rem;
            font-weight: 800;
            color: #f47621;
            line-height: 1;
            margin: 0 0 12px;
        }
        .error-title {
            font-size: 1.8rem;
            font-weight: 800;
            color: #0b192c;
            margin: 0 0 14px;
        }
        .error-desc {
            font-size: 1rem;
            color: #64748b;
            line-height: 1.6;
            margin: 0 0 28px;
        }
        .error-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        }
        .error-links-grid {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
            text-align: left;
        }
        .error-links-title {
            font-size: 0.92rem;
            font-weight: 700;
            color: #0b192c;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .error-links-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .error-links-list a {
            color: #0284c7;
            text-decoration: none;
            font-size: 0.92rem;
            font-weight: 600;
        }
        .error-links-list a:hover {
            color: #f47621;
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-content">
                <a href="/index.html" class="logo" aria-label="Starline Adventures Home">
                    <img src="/images/logo.jpeg" alt="STARLINE ADVENTURES PVT LTD" decoding="async">
                </a>
                <nav class="nav-menu">
                    <a href="/index.html">Home</a>
                    <a href="/products.html">Products</a>
                    <a href="/portfolio.html">Projects</a>
                    <a href="/contact.html">Contact</a>
                </nav>
            </div>
        </div>
    </header>

    <main class="error-page-wrap">
        <div class="error-card">
            <div class="error-code">404</div>
            <h1 class="error-title">Page Not Found</h1>
            <p class="error-desc">The page you were looking for might have been moved, renamed, or is temporarily unavailable. Use the links below to find what you need.</p>
            
            <div class="error-actions">
                <a href="/index.html" class="btn btn-primary">Return Home</a>
                <a href="/products.html" class="btn btn-secondary">Explore Products</a>
                <a href="/contact.html" class="btn btn-secondary">Contact Us</a>
            </div>

            <div class="error-links-grid">
                <div class="error-links-title">Popular Adventure Rides:</div>
                <ul class="error-links-list">
                    <li><a href="/giant-swing-manufacturer/">Giant Swing Manufacturer</a></li>
                    <li><a href="/zipline-manufacturer/">Zipline Manufacturer</a></li>
                    <li><a href="/rope-course-manufacturer/">Rope Course Manufacturer</a></li>
                    <li><a href="/climbing-wall-manufacturer/">Climbing Wall Manufacturer</a></li>
                    <li><a href="/sky-cycling-manufacturer/">Sky Cycling Manufacturer</a></li>
                    <li><a href="/multi-activity-tower-manufacturer/">Multi Activity Tower</a></li>
                </ul>
            </div>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <p class="footer-copyright">&copy; 2026 Starline Adventures Pvt Ltd. All Rights Reserved. &bull; <a href="/contact.html" style="color: #cbd5e1;">Contact Engineering Team</a></p>
        </div>
    </footer>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '404.html'), notFoundHtml, 'utf8');

// Update sitemap.xml
console.log("Generating comprehensive sitemap.xml...");
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://starlineadventures.com/</loc>
    <lastmod>2026-09-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://starlineadventures.com/about.html</loc>
    <lastmod>2026-09-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://starlineadventures.com/products.html</loc>
    <lastmod>2026-09-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://starlineadventures.com/portfolio.html</loc>
    <lastmod>2026-09-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://starlineadventures.com/gallery.html</loc>
    <lastmod>2026-09-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://starlineadventures.com/team.html</loc>
    <lastmod>2026-09-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://starlineadventures.com/testimonials.html</loc>
    <lastmod>2026-09-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://starlineadventures.com/contact.html</loc>
    <lastmod>2026-09-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;

generatedUrls.forEach(item => {
  sitemapXml += `  <url>
    <loc>${item.url}</loc>
    <lastmod>2026-09-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
`;
});

sitemapXml += `</urlset>\n`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXml, 'utf8');

// Update robots.txt
console.log("Generating robots.txt...");
const robotsTxt = `User-agent: *
Allow: /
Allow: /css/
Allow: /js/
Allow: /images/
Allow: /logos/
Disallow: /api/
Disallow: /.secure_store/

Sitemap: https://starlineadventures.com/sitemap.xml
`;
fs.writeFileSync(path.join(__dirname, 'robots.txt'), robotsTxt, 'utf8');

console.log("Saving redirects map for server.js...");
fs.writeFileSync(
  path.join(__dirname, 'seo-redirects-map.json'),
  JSON.stringify(REDIRECT_ALIASES, null, 2),
  'utf8'
);

console.log("SEO Generation complete!");

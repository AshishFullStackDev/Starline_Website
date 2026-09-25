/**
 * STARLINE ADVENTURES - PRODUCTS CATALOGUE MODULE
 * Contains 58 verified products (18 Activities, 40 Equipment).
 * Images are assigned only when strictly matching. Otherwise empty for user upload.
 * Clicking "View Info" opens the dedicated product details page (product-details.html?product=id).
 */

const STARLINE_PRODUCTS = [
    {
        id: "rocket-ejection",
        name: "Rocket Ejection",
        image: "images/ejector_square.jpeg",
        shortDesc: "High-altitude twin-tower reverse bungee catapult launching riders skyward with intense thrill.",
        fullDesc: "The Rocket Ejection is a flagship high-altitude thrill attraction. Using heavy-gauge tensioned bungee cords and automated launch winches between structural steel towers, riders are propelled rapidly skyward to experience intense vertical acceleration and breathtaking zero-gravity freefall.",
        specs: [
            { label: "Age Group", value: "10 years & above" },
            { label: "Installation Type", value: "Outdoor Destination / Theme Park" },
            { label: "Weight Capacity", value: "Max 100 kg per rider" },
            { label: "Footprint / Dimensions", value: "15ft (W) x 30ft (L) x 42ft (H)" },
            { label: "Materials & Components", value: "Metallic structural steel, 3-phase electric brake motor, worm gearbox & remote control console, drum, pedestal bearing, 12mm bungee cord, 12mm static rope, alloy/steel carabiners, ejection hook, harness, helmet, wire ropes." }
        ]
    },
    {
        id: "giant-swing",
        name: "Giant Swing",
        image: "images/Giant swing new.jpeg",
        shortDesc: "Massive A-frame pendulum swing providing exhilarating free-fall release and wide weightless arcs.",
        fullDesc: "The Giant Swing hoists 2 to 4 riders to great heights before an instantaneous mechanical release drops them in a high-speed pendulum swing over open valleys or resort grounds, offering unmatched weightless thrills.",
        specs: [
            { label: "Age Group", value: "10 years & above" },
            { label: "Installation Type", value: "Outdoor / Cliff / Open Ground" },
            { label: "Participant Capacity", value: "2 to 4 persons simultaneously" },
            { label: "Tower Height Options", value: "40ft / 50ft / 60ft / 70ft / 100ft" },
            { label: "Materials & Components", value: "Heavy MS structural frame, 3HP industrial gearbox and brake motor, remote console, modified multi-rider swing harness, alloy/iron carabiners, 12mm galvanised wire rope, quick-release lock, U-clamps, pedestal bearings." }
        ]
    },
    {
        id: "4-in-1-bungee-jumping",
        name: "4 in 1 Bungee Jumping",
        image: "", // Empty placeholder - no authentic image exists
        shortDesc: "Four-station bungee trampolines that let a group bounce and flip together.",
        fullDesc: "A high-throughput crowd favorite for amusement parks and family entertainment zones. Four motorized winch stations combined with elastic bungee cords allow jumpers to achieve heights up to 25 feet and execute flips safely.",
        specs: [
            { label: "Age Group", value: "6 to 15 years & adults" },
            { label: "Installation Type", value: "Outdoor / Indoor Arena" },
            { label: "Capacity", value: "4 simultaneous jumpers (Max 80 kg each)" },
            { label: "Footprint", value: "35ft x 35ft" },
            { label: "Materials & Components", value: "3-phase electric brake motors, worm gearbox, central remote control panel, single pulleys, alloy carabiners, static ropes, heavy bungee cords, full-body harnesses, commercial trampolines with safety branding covers." }
        ]
    },
    {
        id: "zip-line",
        name: "Zip Line",
        image: "images/zipline_square.jpeg",
        shortDesc: "A classic overhead zip line that carries riders on a cable run through the site.",
        fullDesc: "Engineered to international safety standards, Starline zip lines connect takeoff and landing platforms with heavy-duty galvanized wire ropes, enabling participants to glide at high speeds across nature canopies, lakes, and rugged terrain.",
        specs: [
            { label: "Age Group", value: "6 years & above" },
            { label: "Installation Type", value: "Outdoor Nature Park / Resort / Hill Station" },
            { label: "Weight Capacity", value: "Max 110 kg per rider" },
            { label: "Span Length", value: "50m to 1000m+ customized span" },
            { label: "Materials & Components", value: "Mild steel launch/landing towers, Usha Martin galvanized wire rope, tiger U-clamps, thimbles, turnbuckles, tandem high-speed ball-bearing pulleys, zip stopper brake, seat/full-body harnesses, helmets." }
        ]
    },
    {
        id: "zip-bike-sky-cycle",
        name: "Zip Bike / Sky Cycle",
        image: "images/sky_cycle_square.jpeg",
        shortDesc: "A cycle suspended from an overhead cable, letting riders pedal high above the ground.",
        fullDesc: "Participants pedal specially modified aerodynamic bicycles across elevated overhead cable lines. Engineered with counterweights and redundant safety tethers to provide a smooth, exhilarating, self-balancing aerial ride.",
        specs: [
            { label: "Age Group", value: "10 years & above" },
            { label: "Installation Type", value: "Indoor / Outdoor Aerial Circuit" },
            { label: "Weight Capacity", value: "Max 110 kg" },
            { label: "Configurations", value: "Single cycle · Double cycle · Two-way reciprocal line" },
            { label: "Materials & Components", value: "Mild steel terminal frames, galvanized wire ropes, tiger U-clamps, turnbuckles, alloy-wheel sports cycles, 360° rotating harness connector, safety seat belts, helmets, tandem pulleys, dynamic rope slings." }
        ]
    },
    {
        id: "sky-roller",
        name: "Sky Roller",
        image: "images/sky_roller_square.jpeg",
        shortDesc: "A rolling wheel-cage that carries a rider along an elevated cable line.",
        fullDesc: "A distinctive aerial motion attraction where participants step inside a rolling cylindrical capsule that glides suspended on high-tension wire ropes, delivering rotating views and smooth forward momentum.",
        specs: [
            { label: "Age Group", value: "10 years & above" },
            { label: "Installation Type", value: "Outdoor Adventure Park" },
            { label: "Weight Capacity", value: "Max 110 kg" },
            { label: "Track Span", value: "50m to 200m" },
            { label: "Materials & Components", value: "Mild steel rolling cage structure, galvanized high-tension wire rope, tiger U-clamps, thimbles, tandem safety pulleys, harness system, safety helmet, impact buffers." }
        ]
    },
    {
        id: "wall-climbing",
        name: "Wall Climbing",
        image: "images/wall_climbing_square.jpeg",
        shortDesc: "A textured climbing panel with holds set in a colour and layout of your choice.",
        fullDesc: "Custom-manufactured climbing walls built for high durability and authentic feel. Available in rock-realistic FRP textures and vibrant bouldering modular setups with auto-belays and multi-pitch safety anchors.",
        specs: [
            { label: "Age Group", value: "6 years & above" },
            { label: "Installation Type", value: "Outdoor / Indoor Facility" },
            { label: "Lane Capacity", value: "Max 110 kg per lane" },
            { label: "Wall Height", value: "20ft to 50ft+ (Customized)" },
            { label: "Materials & Components", value: "Heavy structural MS framework, heavy-grade FRP climbing panels, ergonomic modular climbing holds, high-tension fasteners, static and dynamic climbing ropes, auto-belay / GRI-GRI devices, harnesses, safety landing mats." }
        ]
    },
    {
        id: "net-climbing",
        name: "Net Climbing",
        image: "", // Empty for user image upload
        shortDesc: "A tensioned rope net for riders to climb up, across or through.",
        fullDesc: "Constructed with industrial-strength braided nylon and steel-core ropes, Net Climbing develops physical coordination, agility, and stamina. Can be mounted vertically or diagonally across towers and obstacle arenas.",
        specs: [
            { label: "Age Group", value: "6 years & above" },
            { label: "Installation Type", value: "Outdoor / Adventure Tower" },
            { label: "Capacity", value: "Continuous multi-user flow" },
            { label: "Dimensions", value: "Tailored to tower or frame dimensions" },
            { label: "Materials & Components", value: "Mild steel framework, UV-resistant braided nylon cargo netting, steel wire ropes, U-clamps, static ropes, harnesses, helmets, carabiners." }
        ]
    },
    {
        id: "ninja-rope-courses",
        name: "Ninja Rope Courses",
        image: "images/rope_course_square.jpeg",
        shortDesc: "A multi-level obstacle rig of ropes, nets and beams inspired by ninja-warrior courses.",
        fullDesc: "A modular, multi-tier aerial obstacle course featuring a continuous safety belay lifeline. Participants navigate suspended bridges, swinging logs, rope webs, balance beams, and cargo nets designed for high guest throughput.",
        specs: [
            { label: "Age Group", value: "6 years & above" },
            { label: "Installation Type", value: "Indoor / Outdoor" },
            { label: "Throughput", value: "Continuous multi-user capacity (20-60 users/hr)" },
            { label: "Course Levels", value: "1, 2 or 3 elevated tiers" },
            { label: "Materials & Components", value: "Structural steel support columns, FRP elements, treated hardwood planks, steel wire ropes, turnbuckles, thimbles, continuous belay track, certified harnesses, helmets." }
        ]
    },
    {
        id: "multi-activity-tower",
        name: "Multi Activity Tower",
        image: "images/tower_square.jpeg",
        shortDesc: "A layered adventure tower combining climbs, nets, swings and zip elements in one structure.",
        fullDesc: "The Multi Activity Tower consolidates 4 to 8 popular adventure activities into a single compact footprint. Accommodates wall climbing, rappelling, zipline takeoff, net climb, and quick-jump freefall from a centralized steel structure.",
        specs: [
            { label: "Age Group", value: "6 years & above" },
            { label: "Installation Type", value: "Outdoor Adventure Park / Resort" },
            { label: "Simultaneous Users", value: "20 to 30 participants at once" },
            { label: "Tower Height", value: "35ft to 60ft" },
            { label: "Materials & Components", value: "Heavy structural MS lattice framework, corrosion-resistant coating, modular activity platforms, certified anchor brackets, safety railings, wire ropes, turnbuckles, PPE harnesses, helmets." }
        ]
    },
    {
        id: "glass-bridge",
        name: "Glass Bridge",
        image: "images/glass_square.jpg",
        shortDesc: "A see-through glass walkway suspended across a gap or canyon.",
        fullDesc: "A spectacular engineering marvel and tourist magnet. Constructed with triple-layer toughened laminated safety glass and heavy-duty structural steel trusses, offering visitors breathtaking views directly beneath their feet.",
        specs: [
            { label: "Age Group", value: "All ages (5 years & above)" },
            { label: "Installation Type", value: "Outdoor Valley / Hill / Resort" },
            { label: "Guest Capacity", value: "50 to 100+ visitors at once" },
            { label: "Bridge Span", value: "20m to 150m+ (Site tailored)" },
            { label: "Materials & Components", value: "High-grade structural steel trusses, toughened laminated multi-layer sandwich glass panels, galvanised stay wire ropes, turnbuckles, stainless steel safety balustrades and handrails." }
        ]
    },
    {
        id: "suspension-bridge",
        name: "Suspension Bridge",
        image: "", // Empty for user image upload
        shortDesc: "A swaying rope-and-plank bridge for crossing valleys and rivers.",
        fullDesc: "A classic adventure walkway suspended across gorges, water bodies, or tree canopies. Built with heavy-gauge galvanized main cables, anti-slip decking, and high-tensile safety netting for a scenic, gently swaying crossing.",
        specs: [
            { label: "Age Group", value: "All age groups" },
            { label: "Installation Type", value: "Outdoor Landscape / River Crossing" },
            { label: "Capacity", value: "50 to 80 persons simultaneously" },
            { label: "Dimensions", value: "50ft to 500ft length x 6ft width" },
            { label: "Materials & Components", value: "Galvanized steel wire ropes, tiger U-clamps, mild steel anchor frames, weather-treated wooden/composite decking planks, metal wire protection mesh, thimbles, turnbuckles." }
        ]
    },
    {
        id: "human-gyro",
        name: "Human Gyro",
        image: "images/gyro_square.jpeg",
        shortDesc: "A rotating gyroscope ride that spins seated riders through 360° in every direction.",
        fullDesc: "Modeled after space simulation and aerospace pilot training systems, the Human Gyro rotates riders freely across three concentric axes. Gives riders an incredible sensation of weightlessness and 3D rotational motion in total safety.",
        specs: [
            { label: "Age Group", value: "8 years & above" },
            { label: "Installation Type", value: "Indoor / Outdoor" },
            { label: "Seater Capacity", value: "2-Seater (200 kg) up to 6-Seater (600 kg)" },
            { label: "Footprint", value: "8ft x 15ft" },
            { label: "Materials & Components", value: "Heavy MS tubular concentric rings, foam padded bucket seats, 3HP gearbox with electric motor and control panel, high-tension fasteners, 4-point safety harnesses, PU/powder-coated anti-rust finish." }
        ]
    },
    {
        id: "roller-coaster",
        name: "Roller Coaster",
        image: "", // Empty for user image upload
        shortDesc: "A suspended rail ride that carries seated riders on loops and curves through the sky.",
        fullDesc: "A high-speed suspended tubular rail adventure coaster customized to your resort or park topography. Riders glide through scenic banked curves, dips, and accelerating downhill sweeps in individual or connected train coaches.",
        specs: [
            { label: "Age Group", value: "8 years & above" },
            { label: "Installation Type", value: "Outdoor Landscape / Indoor Complex" },
            { label: "Weight Capacity", value: "Max 110 kg per rider" },
            { label: "Track Length", value: "Custom engineered as per site acreage" },
            { label: "Materials & Components", value: "Precision tubular structural steel track, heavy-duty foundation columns, galvanized wire ropes, locking lap-bar seat assemblies, pneumatic braking stations, roller-coaster bogie pulleys." }
        ]
    },
    {
        id: "360-degree-cycle",
        name: "360 Degree Cycle",
        image: "images/360_square.jpeg",
        shortDesc: "A single wheel-frame cycle that lets riders pedal a full vertical loop.",
        fullDesc: "Riders pedal a counterbalanced sports bicycle inside a vertical circular steel loop, generating kinetic energy to complete a full 360-degree loop-the-loop inversion safely locked to the circular rail.",
        specs: [
            { label: "Age Group", value: "8 years to adults (up to 80 kg)" },
            { label: "Installation Type", value: "Outdoor / Indoor Adventure Zone" },
            { label: "Weight Capacity", value: "Max 80 kg" },
            { label: "Dimensions", value: "6ft (W) x 10ft (L) x 12ft (H)" },
            { label: "Materials & Components", value: "Metallic circular steel structure, alloy-wheel sports bicycle, anti-corrosion powder coating, high-tension nuts & bolts, specially modified full-body harness, safety helmet, counterweight assembly." }
        ]
    },
    {
        id: "bull-ride",
        name: "Bull Ride",
        image: "images/Bull_ride.jpeg", 
        shortDesc: "A mechanical rodeo bull set on a cushioned inflatable ring.",
        fullDesc: "The ultimate carnival and party attraction. Features a realistic bucking and spinning mechanical bull with dual-axis motorized movement and multiple operator speed settings, surrounded by a cushioned commercial inflatable arena.",
        specs: [
            { label: "Age Group", value: "7 years & above" },
            { label: "Installation Type", value: "Indoor / Outdoor" },
            { label: "Rider Capacity", value: "Max 90-100 kg (1 rider at a time)" },
            { label: "Dimensions", value: "16ft diameter ring, 2ft height" },
            { label: "Materials & Components", value: "Metallic steel chassis, 460 GSM commercial SRF inflatable base, heavy-grade FRP bull body with leather saddle, single-phase motor with dual-axis gearbox, digital control console, high-output air blower." }
        ]
    },
    {
        id: "rifle-shooting",
        name: "Rifle Shooting",
        image: "", // Empty for user image upload
        shortDesc: "A dedicated target range for precision shooting with air rifles.",
        fullDesc: "A supervised skill range featuring target backdrops, pellet-catch boxes, and individual lane dividers. Engineered with strict ballistic safety containment for engaging resort target sports.",
        specs: [
            { label: "Age Group", value: "10 years & above" },
            { label: "Installation Type", value: "Indoor / Outdoor Range" },
            { label: "Lane Capacity", value: "2 to 6 shooting lanes" },
            { label: "Range Distance", value: "10-meter standard target distance" },
            { label: "Materials & Components", value: "Calibre 0.177 target air rifles, steel pellet-catcher target boxes, safety lane partitions, heavy-duty ballistic safety backstop curtains, safety shooting glasses." }
        ]
    },
    {
        id: "archery",
        name: "Archery",
        image: "", // Empty for user image upload
        shortDesc: "A traditional bow-and-arrow range for testing focus and accuracy.",
        fullDesc: "A complete archery range solution equipped with lightweight recurve and compound bows, safe fiberglass arrows, high-density layered foam and straw target stands, and perimeter safety backdrop netting.",
        specs: [
            { label: "Age Group", value: "8 years & above" },
            { label: "Installation Type", value: "Outdoor / Indoor" },
            { label: "Lane Capacity", value: "2 to 6 target lanes" },
            { label: "Range Distance", value: "5m to 20m shooting distances" },
            { label: "Materials & Components", value: "Recurve & compound bows (15-25 lbs draw weight), safety fiberglass target arrows, high-density layered target bosses with stands, arm guards, finger tabs, safety arrow-stop netting." }
        ]
    },
    {
        id: "open-gym-equipment",
        name: "Open Gym Equipment",
        image: "", // Empty for user image upload
        shortDesc: "Heavy-duty outdoor fitness and workout stations for public parks, resorts, and open-air recreational spaces.",
        fullDesc: "High-durability commercial outdoor open gym and fitness stations designed for all age groups. Built with heavy-gauge galvanized mild steel pipes, anti-corrosive powder coating, self-lubricating nylon bearings, and ergonomic handles to withstand harsh outdoor weather conditions.",
        specs: [
            { label: "Age Group", value: "12 years & above" },
            { label: "Installation Type", value: "Outdoor Parks / Resorts / Residential Campuses" },
            { label: "Available Stations", value: "Air Walker, Chest Press, Lat Pull-Down, Shoulder Builder, Twister, Leg Press, Sit-up Bench, Cross Trainer" },
            { label: "Materials & Coating", value: "Heavy-gauge galvanized MS pipe (B-Class), zinc primer, UV-resistant dual-layer powder coating, stainless steel fasteners" },
            { label: "Mounting", value: "Reinforced RCC pedestal / concrete footing ground anchoring" }
        ]
    },
    {
        id: "climbing-wall-equipment",
        name: "Climbing Wall Equipment",
        image: "", // Empty for user image upload
        shortDesc: "Professional hardware, modular holds, safety belay devices, and mounting accessories for artificial climbing walls.",
        fullDesc: "Comprehensive commercial equipment and hardware packages for artificial rock climbing walls and bouldering facilities. Includes ergonomic textured modular holds, high-tensile T-nuts and socket cap bolts, magnetic/hydraulic auto-belay units, dynamic climbing ropes, and safety padding.",
        specs: [
            { label: "Application", value: "Indoor / Outdoor Artificial Climbing Walls & Bouldering Arenas" },
            { label: "Components Included", value: "Modular climbing holds (Jugs, Pinches, Slopers, Crimps), stainless steel M10 T-nuts & bolts, top anchors, auto-belay devices" },
            { label: "Compliance", value: "CE / EN 12572 compliant climbing wall hardware" },
            { label: "Safety Ratings", value: "Anchor stations rated up to 25 kN minimum breaking strength" },
            { label: "Material", value: "High-friction UV-stabilized polyurethane composite resin, grade 8.8 / 304 stainless steel hardware" }
        ]
    },
    {
        id: "rope-course-equipment",
        name: "Rope Course Equipment",
        image: "", // Empty for user image upload
        shortDesc: "Certified continuous belay lifelines, trolleys, clamps, harnesses, and hardware for high & low rope obstacle courses.",
        fullDesc: "Specialized rigging hardware and safety components engineered for high and low aerial rope challenge courses. Features continuous belay lifeline track trolleys, zinc-plated heavy-duty turnbuckles, galvanized steel wire ropes, forged wire rope clamps, heavy-duty thimbles, and safety tethers.",
        specs: [
            { label: "Application", value: "High Rope & Low Rope Obstacle Courses / Aerial Adventure Parks" },
            { label: "Included Hardware", value: "Continuous belay trolleys, heavy galvanized wire ropes (10mm-16mm), drop-forged turnbuckles, wire rope clips, thimbles, safety slings" },
            { label: "Load Ratings", value: "Minimum 22 kN to 30 kN safety rated hardware components" },
            { label: "Weather Protection", value: "Hot-dip galvanized & marine-grade anti-corrosive rust protection" },
            { label: "Compliance", value: "Conforms to EN 15567 aerial adventure park safety standards" }
        ]
    },
    {
        id: "safety-nets",
        name: "Safety Nets",
        image: "", // Empty for user image upload
        shortDesc: "High-tensile UV-stabilized nylon and polypropylene safety fall-arrest and debris containment nets.",
        fullDesc: "Heavy-duty industrial and adventure-grade safety catch nets engineered for fall protection under rope courses, zip lines, suspension bridges, trampolines, and climbing structures. Made from knotted or knotless high-tenacity UV-stabilized nylon/polypropylene cordage with reinforced perimeter border ropes.",
        specs: [
            { label: "Application", value: "Fall protection under rope courses, bridges, zipline landing zones, and elevated platforms" },
            { label: "Cord Material", value: "High-tenacity UV-stabilized Polyamide / Polypropylene braided rope" },
            { label: "Mesh Size & Thickness", value: "40mm to 100mm mesh square aperture; 4mm to 8mm cord diameter" },
            { label: "Border Rope", value: "12mm - 16mm high-strength braided border rope with reinforced corner loops" },
            { label: "Impact Resistance", value: "Tested for heavy drop loads with high energy absorption and weather resistance" }
        ]
    },
    {
        id: "safety-harness-belts",
        name: "Safety Harness & Belts",
        image: "", // Empty for user image upload
        shortDesc: "Full-body and sit safety harnesses with adjustable padded straps and high-tensile alloy attachment points.",
        fullDesc: "Ergonomically designed commercial full-body and sit-in safety harnesses engineered for maximum comfort, security, and quick adjustment during adventure park operations. Fitted with heavy-duty polyester webbing, forged alloy steel D-rings, self-locking rapid-adjust buckles, and breathable padding.",
        specs: [
            { label: "Harness Types", value: "Full-Body Adventure Harness, Sit / Seat Harness, Chest Harness, Kids Harness" },
            { label: "Webbing Material", value: "High-tenacity 44mm/45mm polyester webbing with high abrasion resistance" },
            { label: "Breaking Strength", value: "Rated to 22 kN (2200 kg) breaking load capacity" },
            { label: "Fasteners & Rings", value: "Forged alloy steel dorsal & ventral attachment D-rings with corrosion-resistant finish" },
            { label: "Standards & Certification", value: "CE / EN 361, EN 12277, IS 3521 certified for adventure sports and fall arrest" }
        ]
    },
    {
        id: "zipline-safety-equipment",
        name: "Zipline Safety Equipment",
        image: "", // Empty for user image upload
        shortDesc: "High-speed tandem dual-bearing trolleys, zip stoppers, impact brake springs, and lanyard assemblies.",
        fullDesc: "Complete commercial zipline operations safety kit containing high-speed tandem wire-cable trolleys with stainless steel ball bearings, magnetic or spring-loaded progressive zip braking blocks, bungee deceleration systems, secondary safety backup lanyards, and high-strength oval/pear carabiners.",
        specs: [
            { label: "Compatibility", value: "Steel wire cables from 8mm to 16mm diameter" },
            { label: "Key Components", value: "High-speed tandem pulleys / trolleys, progressive spring brake buffers, zip stop blocks, dynamic lanyard slings, heavy-duty carabiners" },
            { label: "Pulley Speed Rating", value: "High-velocity sealed ball bearings rated up to 25 m/s (90 km/h)" },
            { label: "Breaking Strength", value: "Trolley and carabiner systems rated at 25 kN to 30 kN minimum" },
            { label: "Safety Standards", value: "CE / EN 12278 & UIAA certified components for commercial zip tours" }
        ]
    },
    {
        id: "climbing-ropes",
        name: "Climbing Ropes",
        image: "", // Empty for user image upload
        shortDesc: "Certified static and dynamic kernmantle climbing, rappelling, and safety rigging ropes.",
        fullDesc: "Premium kernmantle construction adventure ropes suitable for rock climbing walls, multi-activity towers, rappelling, rescue rigging, and obstacle course ascents. Available in both low-stretch static configurations for rappelling/hauling and dynamic high-energy absorption options for lead climbing.",
        specs: [
            { label: "Rope Types", value: "Static Low-Stretch Kernmantle Ropes & Dynamic Climbing Ropes" },
            { label: "Diameters Available", value: "9.5mm, 10.5mm, 11mm, 12mm & 14mm" },
            { label: "Core & Sheath", value: "High-grade 100% polyamide (nylon) with braided abrasion-resistant outer sheath" },
            { label: "Breaking Strength", value: "Minimum breaking strength 28 kN to 35 kN (depending on diameter)" },
            { label: "Standards & Certification", value: "CE / EN 1891 Type A (Static) & EN 892 (Dynamic), UIAA certified" }
        ]
    },
    {
        id: "carabiners-connectors",
        name: "Carabiners & Connectors",
        image: "", // Empty for user image upload
        shortDesc: "High-strength alloy steel and aluminium screw-lock, twist-lock, and auto-locking connector carabiners.",
        fullDesc: "Certified heavy-duty connector hardware engineered for adventure park zip lines, belay lines, harness connections, and rope rescue. Features high-tensile hot-forged aluminium alloy and zinc-plated alloy steel construction with snag-free keylock noses and rapid triple-action auto-locking sleeves.",
        specs: [
            { label: "Locking Types", value: "Screw-lock, Twist-lock (2-stage), Auto-lock (3-stage), Quick-link (Mailon Rapide)" },
            { label: "Gate Opening", value: "18mm to 28mm wide gate clearance" },
            { label: "Breaking Strength", value: "Major axis 25 kN to 50 kN; Minor axis 8 kN to 15 kN; Gate open 8 kN to 12 kN" },
            { label: "Materials", value: "Hot-forged 7075 aviation aluminium alloy / Heat-treated drop-forged alloy steel" },
            { label: "Standards", value: "CE EN 362, EN 12275, UIAA 121 certified" }
        ]
    },
    {
        id: "belay-devices",
        name: "Belay Devices",
        image: "", // Empty for user image upload
        shortDesc: "Assisted-braking, manual friction belay devices, and descent controllers for climbing and rappelling.",
        fullDesc: "Professional manual and assisted-braking belay and descent control devices for climbing walls, rope towers, and rappelling operations. Provides smooth rope feed, progressive cam friction, and anti-panic locking mechanisms to ensure failsafe belayer control.",
        specs: [
            { label: "Device Types", value: "Assisted-braking devices (GRI-GRI type), Figure-8 descenders, Tubular ATC belay plates, Auto-locking descenders" },
            { label: "Rope Compatibility", value: "Single ropes from 8.5mm to 11mm; Figure-8 up to 13mm" },
            { label: "Material Build", value: "High-strength hot-forged aluminium side plates with stainless steel cam & friction pads" },
            { label: "Maximum Working Load", value: "150 kg to 200 kg rated operational load" },
            { label: "Standards", value: "CE EN 15151-1 / EN 15151-2, UIAA certified" }
        ]
    },
    {
        id: "climbing-holds",
        name: "Climbing Holds",
        image: "", // Empty for user image upload
        shortDesc: "Ergonomic textured polyurethane and composite modular hand & foot holds in diverse route shapes.",
        fullDesc: "High-grip textured modular climbing holds and volume grips designed for artificial climbing walls and bouldering arenas. Available in varying sizes and gripping styles (jugs, pinches, slopers, crimps, and footholds) with dual-attachment bolt and screw-hole configurations.",
        specs: [
            { label: "Grip Shapes", value: "Jugs, Slopers, Pinches, Pockets, Crimps, Edges, Footholds & Macro Volumes" },
            { label: "Materials", value: "UV-stabilized polyurethane (PU) resin / Non-toxic fiberglass reinforced composite" },
            { label: "Fastening System", value: "M10 / 3/8\" socket cap Allen bolt with secondary anti-spin screw holes" },
            { label: "Surface Finish", value: "Skin-friendly micro-textured friction surface with anti-fade vibrant pigments" },
            { label: "Compliance", value: "EN 12572-3 climbing hold safety specification" }
        ]
    },
    {
        id: "climbing-wall-panels",
        name: "Climbing Wall Panels",
        image: "", // Empty for user image upload
        shortDesc: "Heavy-duty FRP, ply-resin composite, and textured 3D climbing wall panels with pre-drilled T-nut grids.",
        fullDesc: "Structural artificial rock panels and bouldering wall surfaces engineered for high impact and weather durability. Manufactured in 3D realistic rock face textures or flat geometric multiplex plywood coated with quartz-sand friction resin, featuring dense grids of stainless steel T-nut insert anchors.",
        specs: [
            { label: "Panel Types", value: "3D Realistic FRP Rock Panels, Birch Multiplex Plywood, Modular Bouldering Panels" },
            { label: "Standard Thickness", value: "18mm to 21mm engineered structural multi-ply / 6mm FRP with rear rib reinforcements" },
            { label: "Grid Spacing", value: "100mm x 100mm to 150mm x 150mm standard matrix of M10 T-nuts" },
            { label: "Texture & Coating", value: "High-friction UV-resistant polyurethane quartz grit coating (Class 1 fire rated option)" },
            { label: "Standards", value: "Conforms to EN 12572-1 artificial climbing wall structural standards" }
        ]
    },
    {
        id: "climbing-wall-anchors",
        name: "Climbing Wall Anchors",
        image: "", // Empty for user image upload
        shortDesc: "Top-rope anchor stations, lower-off rings, stainless steel hanger plates, and heavy expansion anchor bolts.",
        fullDesc: "Engineered top-rope and lead climbing anchor stations manufactured from marine-grade 304/316 stainless steel. Includes dual-point equalized chain assemblies, heavy-duty lower-off steel carabiners/rings, and high-tensile structural expansion bolt anchors.",
        specs: [
            { label: "Assembly", value: "Dual hanger plates, stainless steel chain link equalizer, wear-resistant steel carabiner / solid ring" },
            { label: "Bolt Specifications", value: "M10 / M12 304/316 stainless steel expansion bolts and chemical resin anchors" },
            { label: "Minimum Breaking Strength", value: "25 kN to 30 kN multi-directional load capacity" },
            { label: "Corrosion Resistance", value: "Class 1 marine and outdoor environmental corrosion protection" },
            { label: "Standards", value: "CE EN 959, EN 795 (Type A), EN 12572-1 certified anchor systems" }
        ]
    },
    {
        id: "rope-course-platforms",
        name: "Rope Course Platforms",
        image: "", // Empty for user image upload
        shortDesc: "Modular hexagonal, square, and octagonal tree/pole aerial staging platforms with safety railings.",
        fullDesc: "Robust aerial staging and resting platforms built for installation on steel poles, structural columns, or living trees. Built with structural steel subframes, anti-slip treated hardwood/FRP grating decks, and continuous perimeter safety guardrails with integrated lanyard anchor attachments.",
        specs: [
            { label: "Geometries", value: "Hexagonal, Octagonal, Square & Wrap-Around Tree Platform designs" },
            { label: "Structural Frame", value: "Hot-dip galvanized mild steel framing / Heavy treated hardwood timber" },
            { label: "Decking Material", value: "Anti-slip chequered FRP composite grating or treated kiln-dried pine/hardwood planks" },
            { label: "Guardrail Height", value: "1.1m (1100mm) continuous perimeter railing with safety kick-plates" },
            { label: "Load Rating", value: "Engineered for distributed live loads up to 500 kg/m² (Multiple concurrent users)" }
        ]
    },
    {
        id: "rope-course-obstacles",
        name: "Rope Course Obstacles",
        image: "", // Empty for user image upload
        shortDesc: "Modular challenge elements including Burma bridges, swinging logs, wobble boards, and spider webs.",
        fullDesc: "Turnkey aerial obstacle modules designed to challenge balance, coordination, and agility on low and high rope courses. Includes Burma bridges, suspended wooden logs, rolling barrels, zigzag balance beams, cargo net crawls, and aerial crossing bridges.",
        specs: [
            { label: "Element Types", value: "Burma Bridge, Commando Bridge, Swinging Planks, Wobble Logs, Spider Web, Horizontal Net Crawl" },
            { label: "Materials", value: "Heavy-duty treated hardwood, UV-resistant reinforced composite rope, steel wire core rigging" },
            { label: "Span Length", value: "4m to 15m modular crossing spans" },
            { label: "Hardware Included", value: "Stainless steel shackles, zinc-plated eye bolts, turnbuckles, and safety tethers" },
            { label: "Standards", value: "EN 15567-1 / EN 15567-2 compliant obstacle elements" }
        ]
    },
    {
        id: "zipline-trolleys",
        name: "Zipline Trolleys",
        image: "", // Empty for user image upload
        shortDesc: "High-velocity dual-sheave steel and aluminium zipline cable trolleys with sealed precision ball bearings.",
        fullDesc: "Industrial-grade high-speed zipline trolleys designed for commercial canopy tours and long-span zip rides. Built with stainless steel sheaves, sealed high-RPM ball bearings, reinforced alloy cheeks, secondary backup tether connection points, and integrated handlebar grip options.",
        specs: [
            { label: "Sheave Material", value: "High-grade stainless steel with deep cable grooving for wire rope tracking" },
            { label: "Bearing Type", value: "Dual sealed high-precision stainless steel ball bearings per sheave" },
            { label: "Cable Range", value: "Suitable for 9.5mm, 12mm, 14mm, and 16mm galvanized / stainless wire ropes" },
            { label: "Maximum Speed", value: "Rated for line speeds up to 100 km/h (28 m/s)" },
            { label: "Breaking Strength", value: "25 kN to 40 kN certified breaking strength (CE EN 12278)" }
        ]
    },
    {
        id: "zipline-pulleys",
        name: "Zipline Pulleys",
        image: "", // Empty for user image upload
        shortDesc: "Heavy-duty single and tandem rigging pulleys for zip line retrieval, tensioning, and cable guidance.",
        fullDesc: "Specialized high-efficiency tandem and single-sheave pulleys for zipline setup, counterweight return systems, and cable tensioning rigs. Crafted from anodized aviation-grade alloy or stainless steel with rotating side plates for fast midline rope and cable insertion.",
        specs: [
            { label: "Pulley Styles", value: "Tandem Cable Pulleys, Single Swivel Pulleys, Prusik-Minding Pulleys, Snatch Blocks" },
            { label: "Sheave Diameter", value: "38mm to 75mm precision-machined aluminium / stainless steel sheaves" },
            { label: "Efficiency", value: "91% to 97% mechanical rolling efficiency" },
            { label: "Working Load Limit", value: "5 kN to 15 kN (Breaking strength 24 kN to 36 kN)" },
            { label: "Standards", value: "CE EN 12278 certified" }
        ]
    },
    {
        id: "zipline-cables",
        name: "Zipline Cables",
        image: "", // Empty for user image upload
        shortDesc: "High-tensile galvanized and stainless steel wire ropes engineered for commercial long-span ziplines.",
        fullDesc: "Heavy-duty aircraft-grade and crane-grade steel wire cables designed specifically for high-tension zip lines. Manufactured with 6x19, 6x36, or 7x19 IWRC (Independent Wire Rope Core) construction offering exceptional tensile strength, minimal stretch, and smooth trolley tracking.",
        specs: [
            { label: "Wire Construction", value: "6x19 / 6x36 IWRC (Steel Core) & 7x19 Galvanized Aircraft Cable" },
            { label: "Diameters", value: "8mm, 10mm, 12mm, 14mm, and 16mm options" },
            { label: "Material Grade", value: "1770 / 1960 N/mm² High-Tensile Hot-Dip Galvanized Steel (Usha Martin / equivalent)" },
            { label: "Breaking Load", value: "80 kN to 180+ kN minimum breaking load capacity" },
            { label: "Standards", value: "IS 2266 / ISO 2408 / EN 12385 wire rope standards" }
        ]
    },
    {
        id: "zipline-braking-systems",
        name: "Zipline Braking Systems",
        image: "", // Empty for user image upload
        shortDesc: "Progressive spring impact brakes, magnetic zip stoppers, and bungee deceleration catch blocks.",
        fullDesc: "Comprehensive multi-tier deceleration and emergency stopping systems for commercial zipline landings. Combines primary progressive compression spring banks, heavy-duty polyurethane catch blocks, bungee cord rebound absorbers, and magnetic eddy-current ZipStop units for smooth, fail-safe rider deceleration.",
        specs: [
            { label: "Brake Types", value: "Multi-stage Spring Banks, Bungee Deceleration Systems, Magnetic ZipStop Arrester Blocks" },
            { label: "Materials", value: "High-tensile stainless steel compression springs, ultra-high-molecular-weight (UHMW) polyethylene stop blocks" },
            { label: "Spring Bank Length", value: "3m to 9m progressive spring assemblies" },
            { label: "Rider Capacity", value: "Smooth deceleration for riders weighing 20 kg to 120 kg at entry speeds up to 60 km/h" },
            { label: "Redundancy", value: "Dual primary and secondary fail-safe emergency arrest mechanism" }
        ]
    },
    {
        id: "adventure-safety-lanyards",
        name: "Adventure Safety Lanyards",
        image: "", // Empty for user image upload
        shortDesc: "Dynamic rope and webbing Y-shaped dual safety lanyards with integrated energy absorption.",
        fullDesc: "Twin-leg Y-lanyards and single connection tethers designed for 100% continuous tie-off on high rope courses, ziplines, and climbing towers. Made from dynamic kernmantle rope or heavy polyester tubular webbing with stitched termination loops and protective transparent wear sleeves.",
        specs: [
            { label: "Lanyard Config", value: "Y-type twin leg (dual arm) & Single leg connection lanyards" },
            { label: "Cord Construction", value: "11mm dynamic energy-absorbing kernmantle rope / 30mm heavy tubular webbing" },
            { label: "Length Options", value: "60cm, 85cm, 100cm, and 120cm leg lengths" },
            { label: "Breaking Strength", value: "22 kN minimum breaking force" },
            { label: "Standards", value: "CE EN 354, EN 355 (Energy Absorber), EN 15567 compliant" }
        ]
    },
    {
        id: "safety-helmets",
        name: "Safety Helmets",
        image: "", // Empty for user image upload
        shortDesc: "Impact-resistant ABS ventilated adventure helmets with rapid dial-fit adjustment systems.",
        fullDesc: "High-durability mountaineering and adventure park safety helmets engineered for superior crown and side impact protection. Features rugged injection-molded ABS outer shells, high-density expanded polypropylene/polystyrene liners, side ventilation channels, and quick-turn dial adjustment wheels.",
        specs: [
            { label: "Shell Material", value: "High-impact Injection Molded ABS Thermoplastic" },
            { label: "Inner Liner", value: "High-density shock-absorbing Expanded Polystyrene (EPS) / EPP foam" },
            { label: "Fit Range", value: "Universal adjustable size (Head circumference 48cm to 62cm) with rear ratchet wheel" },
            { label: "Retention System", value: "4-point chin strap with quick-release buckle and soft chin pad" },
            { label: "Standards", value: "CE EN 12492 (Mountaineering & Height Safety), UIAA 106 certified" }
        ]
    },
    {
        id: "fall-arrest-systems",
        name: "Fall-Arrest Systems",
        image: "", // Empty for user image upload
        shortDesc: "Retractable wire-rope fall arresters, guided-type fall blocks, and vertical lifeline rail assemblies.",
        fullDesc: "Automatic self-retracting lifelines (SRL) and vertical fall-arrest systems for climbing towers, ladder ascents, and high-altitude activity maintenance. Features rapid centrifugal dual-pawl locking brakes and internal energy absorbing packs that arrest freefalls within centimetres.",
        specs: [
            { label: "System Types", value: "Self-Retracting Lifelines (SRL / Inertia Reels), Guided Fall Arresters on rope/cable, Vertical Safety Rails" },
            { label: "Line Lengths", value: "6m, 10m, 15m, 20m, and 30m galvanised wire cable / Dyneema webbing lines" },
            { label: "Arrest Force", value: "Max arrest impact force below 6 kN to protect human anatomy" },
            { label: "Maximum User Weight", value: "136 kg to 150 kg (Single user capacity)" },
            { label: "Standards", value: "CE EN 360 (Retractable Type), EN 353-1 / EN 353-2 certified" }
        ]
    },
    {
        id: "rescue-equipment",
        name: "Rescue Equipment",
        image: "", // Empty for user image upload
        shortDesc: "Evacuation descent devices, rescue reach poles, haul kits, and stretcher systems for park emergencies.",
        fullDesc: "Professional aerial park evacuation and emergency retrieval kit. Contains auto-controlled descenders with rescue lifting wheels, telescoping rescue reach poles for mid-line zip rescue, 3:1/4:1 mechanical advantage pulley haul kits, and rollable rescue stretchers.",
        specs: [
            { label: "Kit Contents", value: "Automatic descent rescuer unit, telescopic retrieval pole (3m-6m), 4:1 mechanical haul kit, rescue harness, static rescue rope (50m-100m)" },
            { label: "Evacuation Speed", value: "Controlled auto-descent rate between 0.8 m/s and 1.5 m/s" },
            { label: "Rope Length", value: "50m to 150m pre-rigged kernmantle static line" },
            { label: "Maximum Rescue Load", value: "Rated for two-person rescue loads up to 225 kg" },
            { label: "Standards", value: "CE EN 341 (Descent Devices for Rescue), EN 1496 (Rescue Lifting)" }
        ]
    },
    {
        id: "steel-cable-rigging-equipment",
        name: "Steel Cable & Rigging Equipment",
        image: "", // Empty for user image upload
        shortDesc: "Heavy drop-forged turnbuckles, wire rope clamps, thimbles, bow shackles, and rigging hardware.",
        fullDesc: "Industrial-grade rigging and cable termination hardware for anchoring, tensioning, and maintaining structural cables on adventure attractions. Manufactured from drop-forged carbon steel and hot-dip galvanized for extreme weather and tensile resilience.",
        specs: [
            { label: "Components", value: "Drop-forged open/closed turnbuckles (Jaw & Eye / Jaw & Jaw), Tiger wire rope U-clamps, heavy steel thimbles, forged bow shackles" },
            { label: "Sizes Available", value: "1/2\", 5/8\", 3/4\", 7/8\", and 1\" threading and pin dimensions" },
            { label: "Finish", value: "Hot-dip galvanized to ASTM A153 / Electro-galvanized anti-corrosion finish" },
            { label: "Working Load Limit", value: "1 Tonne to 15 Tonne certified WLL per component" },
            { label: "Standards", value: "US Federal Spec FF-T-791b (Turnbuckles), FF-C-450 (Clamps), RR-C-271 (Shackles)" }
        ]
    },
    {
        id: "anchoring-fixing-systems",
        name: "Anchoring & Fixing Systems",
        image: "", // Empty for user image upload
        shortDesc: "Heavy-duty chemical anchor studs, mechanical expansion anchors, through-bolts, and base fixing hardware.",
        fullDesc: "High-strength structural concrete and rock anchoring systems engineered for securing tower base plates, climbing walls, guy wires, and adventure platform columns into reinforced concrete footings or natural bedrock.",
        specs: [
            { label: "Fixing Types", value: "Pure epoxy chemical injection anchor studs, heavy wedge expansion anchors, high-tensile foundation J-bolts, rock expansion shield anchors" },
            { label: "Thread Sizes", value: "M12, M16, M20, M24, and M30 diameter studs in grade 8.8 and 316 stainless steel" },
            { label: "Embedment Depth", value: "100mm to 500mm engineered embedment depths" },
            { label: "Tensile / Shear Capacity", value: "Tested pull-out resistance from 35 kN up to 200+ kN per anchor point" },
            { label: "Certifications", value: "ETA (European Technical Assessment) Option 1 for cracked/uncracked concrete" }
        ]
    },
    {
        id: "protective-padding",
        name: "Protective Padding",
        image: "", // Empty for user image upload
        shortDesc: "High-density EPE/PU impact safety pads, pole wraps, and landing crash mats for adventure zones.",
        fullDesc: "Custom-fabricated shock-absorbing safety protective padding and impact-cushioning wraps for steel columns, tree trunks, landing zones, and obstacle corners. Made with high-density closed-cell EPE foam or high-resilience polyurethane foam covered in heavy 650 GSM fire-retardant, waterproof PVC tarpaulin.",
        specs: [
            { label: "Core Foam", value: "50mm to 200mm high-density closed-cell Expanded Polyethylene (EPE) / bonded PU foam" },
            { label: "Outer Fabric", value: "Heavy-duty 550 - 680 GSM UV-resistant, tear-proof PVC coated fabric with reinforced stitching" },
            { label: "Fastening", value: "Heavy industrial Velcro hook-and-loop straps and eyelet lace-up systems" },
            { label: "Weather Resistance", value: "100% waterproof, fungal resistant, UV-stabilized for outdoor exposure" },
            { label: "Customization", value: "Available in custom diameters, column wrap profiles, and high-visibility safety colors" }
        ]
    },
    {
        id: "adventure-park-signage-safety-boards",
        name: "Adventure Park Signage & Safety Boards",
        image: "", // Empty for user image upload
        shortDesc: "UV-resistant reflective safety instruction boards, warning signs, and activity briefing panels.",
        fullDesc: "Weatherproof commercial signage, activity rules boards, directional markers, and operator safety notices designed for adventure parks and resort attractions. Fabricated on heavy ACP (Aluminium Composite Panel) or retro-reflective vinyl with clear pictograms and bilingual instructions.",
        specs: [
            { label: "Board Material", value: "3mm to 4mm heavy Aluminium Composite Panel (ACP) / 3M Retro-Reflective Vinyl / Acrylic" },
            { label: "Printing & Coating", value: "UV-cured digital printing with scratch-resistant matte/gloss protective overlaminate" },
            { label: "Sign Types", value: "General Park Rules, Activity Entry Restrictions (Height/Weight), Step-by-Step Harness Instructions, Emergency Contact Boards, Directional Markers" },
            { label: "Weather Rating", value: "5-year outdoor non-fading warranty against harsh sun and rain exposure" },
            { label: "Compliance", value: "Compliant with ISO 7010 international safety sign standards" }
        ]
    },
    {
        id: "cargo-nets",
        name: "Cargo Nets",
        image: "", // Empty for user image upload
        shortDesc: "Heavy-duty braided nylon and PP climbing, scrambling, and obstacle transition cargo nets.",
        fullDesc: "Industrial-strength adventure cargo climb nets manufactured with knotted or interwoven high-tenacity polypropylene and nylon ropes. Ideal for multi-activity towers, low/high obstacle courses, net scrambles, and commando crawls.",
        specs: [
            { label: "Rope Diameter", value: "12mm, 14mm, 16mm, and 18mm braided multi-strand ropes" },
            { label: "Mesh Aperture", value: "150mm x 150mm to 250mm x 250mm square grid openings" },
            { label: "Border Finishing", value: "Reinforced 18mm-20mm perimeter border rope with integrated steel eye thimbles" },
            { label: "Breaking Strength", value: "High tensile load support capable of multi-person concurrent climbing" },
            { label: "UV Protection", value: "UV-stabilized synthetic yarn engineered for prolonged outdoor sun exposure" }
        ]
    },
    {
        id: "tyre-obstacles",
        name: "Tyre Obstacles",
        image: "", // Empty for user image upload
        shortDesc: "Suspended horizontal and vertical tyre crawl, bridge, and swing obstacle challenge assemblies.",
        fullDesc: "Engaging adventure obstacle assemblies utilizing treated heavy-duty industrial tyres linked with galvanized chains and high-tensile wire rope rigging. Configured as swinging tyre steps, vertical tyre climb walls, or suspended horizontal tyre crawl tunnels.",
        specs: [
            { label: "Tyre Types", value: "Reinforced clean industrial/automobile radial tyres with drainage weep holes" },
            { label: "Suspension Rigging", value: "8mm to 10mm calibrated galvanized short-link steel chain with nylon outer protective sleeves" },
            { label: "Hardware Included", value: "Drop-forged eye bolts, high-tensile shackles, nyloc safety nuts, backing plates" },
            { label: "Configuration Options", value: "Swinging Tyre Steps, Horizontal Tyre Tunnel, Tyre Wall Climb, Suspended Tyre Bridge" },
            { label: "Safety Factor", value: "5:1 structural safety factor on all suspension connections" }
        ]
    },
    {
        id: "balance-beams",
        name: "Balance Beams",
        image: "", // Empty for user image upload
        shortDesc: "Elevated and ground-level timber and steel balance beams with anti-slip friction surfaces.",
        fullDesc: "Precision-crafted balance beam obstacles for ninja courses, low rope challenges, and tactical fitness arenas. Constructed from treated seasoned hardwood, steel-reinforced structural composites, or tubular steel with non-slip textured polyurethane coatings.",
        specs: [
            { label: "Beam Dimensions", value: "100mm to 200mm beam walking width; 3m to 6m span length" },
            { label: "Materials", value: "Seasoned weather-treated hardwood / Galvanized structural steel core with composite cap" },
            { label: "Surface Finish", value: "Anti-slip sanded quartz polyurethane coating for secure grip under wet and dry conditions" },
            { label: "Mounting Hardware", value: "Swivel hinge brackets or rigid foundation pedestal mounting plates" },
            { label: "Height Levels", value: "Available in ground-level (300mm-500mm) and aerial elevated (3m-8m) configurations" }
        ]
    },
    {
        id: "monkey-bars",
        name: "Monkey Bars",
        image: "", // Empty for user image upload
        shortDesc: "Overhead horizontal and inclined steel monkey bar rigs with ergonomic powder-coated rungs.",
        fullDesc: "Classic upper-body obstacle course and calisthenics monkey bar assemblies designed for adventure parks, obstacle races, and open-air workout arenas. Built with heavy-gauge tubular steel framing and smooth grip-textured rungs spaced for optimal reach and safety.",
        specs: [
            { label: "Rung Diameter", value: "32mm to 38mm ergonomic grip diameter" },
            { label: "Rung Spacing", value: "300mm to 400mm center-to-center distance" },
            { label: "Frame Structure", value: "100mm x 100mm / 80mm x 80mm heavy MS structural hollow sections (SHS)" },
            { label: "Finish", value: "Zinc-rich primer with outdoor UV-resistant textured powder coating" },
            { label: "Layouts", value: "Horizontal straight run, inclined ladder, wave monkey bars, and alternating height bars" }
        ]
    },
    {
        id: "parallel-bars",
        name: "Parallel Bars",
        image: "", // Empty for user image upload
        shortDesc: "Commercial dual-rail parallel fitness bars for dips, hand walks, and bodyweight training.",
        fullDesc: "Commercial-grade outdoor parallel bars engineered for calisthenics zones, obstacle fitness trails, and resort sports parks. Features continuous seamless tubular rails, reinforced foundation stanchions, and anti-corrosive dual-layer weather shielding.",
        specs: [
            { label: "Bar Diameter", value: "42mm to 48mm heavy-wall steel tube (comfortable palm grip)" },
            { label: "Bar Length & Height", value: "2.5m to 3.5m length; 1.2m to 1.4m height from ground" },
            { label: "Bar Separation", value: "550mm to 650mm standard ergonomic shoulder width" },
            { label: "Material", value: "B-Class heavy galvanized mild steel pipe with rounded smooth corner bends" },
            { label: "Foundation", value: "Direct embedded concrete footing / Base plate bolted connection" }
        ]
    },
    {
        id: "pull-up-bars",
        name: "Pull-Up Bars",
        image: "", // Empty for user image upload
        shortDesc: "Multi-height commercial outdoor pull-up and chin-up stations with multi-grip options.",
        fullDesc: "Robust multi-height pull-up stations suitable for outdoor fitness circuits, military obstacle courses, and adventure camp training grounds. Available in single, triple, and four-tier height configurations to accommodate participants of different heights.",
        specs: [
            { label: "Bar Heights", value: "Triple tier heights: 1.8m, 2.1m, and 2.4m above ground level" },
            { label: "Grip Diameter", value: "32mm - 34mm seamless round steel tube" },
            { label: "Upright Columns", value: "80mm to 100mm heavy structural MS steel box section" },
            { label: "Surface Coating", value: "Thermoset exterior powder coat with micro-texture for superior hand grip" },
            { label: "Weight Capacity", value: "Tested for dynamic user loads up to 250 kg per station" }
        ]
    },
    {
        id: "horizontal-ladders",
        name: "Horizontal Ladders",
        image: "", // Empty for user image upload
        shortDesc: "Heavy-duty overhead horizontal hand-traverse ladder rigs for obstacle courses and fitness parks.",
        fullDesc: "Elevated horizontal overhead ladder structures engineered for challenging hand-over-hand traverses in ninja arenas, boot camps, and adventure playgrounds. Constructed from heavy structural steel with high-grade weld joints and anti-slip rungs.",
        specs: [
            { label: "Overall Length", value: "3m to 6m traverse span" },
            { label: "Overhead Height", value: "2.2m to 2.6m clearance above safety landing surface" },
            { label: "Rung Specifications", value: "32mm round steel bar welded at 300mm intervals" },
            { label: "Support Uprights", value: "100mm x 100mm heavy square steel columns with gusseted base plates" },
            { label: "Finish", value: "Galvanized + dual-coat epoxy polyurethane outdoor finish" }
        ]
    },
    {
        id: "rope-ladders",
        name: "Rope Ladders",
        image: "", // Empty for user image upload
        shortDesc: "Flexible suspended climbing ladders with hardwood or aluminium rungs and synthetic side ropes.",
        fullDesc: "Commercial flexible climbing ladders for multi-activity towers, high rope course access, and caving/tree obstacles. Features high-tensile braided synthetic side ropes with weather-treated hardwood or textured non-slip aluminium rungs.",
        specs: [
            { label: "Side Ropes", value: "14mm to 16mm high-tenacity braided polypropylene / polyester rope" },
            { label: "Rung Material", value: "40mm diameter seasoned sal/teak hardwood rungs or fluted aluminium tube" },
            { label: "Rung Width", value: "400mm to 500mm step width; 300mm rung-to-rung spacing" },
            { label: "Termination", value: "Spliced eye thimbles with heavy steel carabiners / screw-lock connectors at top and bottom" },
            { label: "Breaking Strength", value: "Ropes and rung assemblies rated to 15 kN breaking load" }
        ]
    },
    {
        id: "suspension-bridges-equipment",
        name: "Suspension Bridges",
        image: "", // Empty for user image upload
        shortDesc: "Modular steel cable suspended pedestrian walkway kits for canopy trails, valleys, and parks.",
        fullDesc: "Turnkey suspension bridge assemblies and hardware kits designed for crossing gorges, water bodies, and forest canopy routes. Includes heavy galvanized main suspension cables, vertical hanger assemblies, treated decking planks, and high-tensile safety side netting.",
        specs: [
            { label: "Span Capability", value: "10m to 150m+ engineered customized clear spans" },
            { label: "Deck Width", value: "1.0m to 1.8m wide pedestrian walking surface" },
            { label: "Cables", value: "Main suspension wire ropes (16mm-24mm), stay cables (12mm-16mm), floor cables (14mm)" },
            { label: "Decking Options", value: "Hardwood planks, chequered aluminium sheet, or FRP anti-slip composite grating" },
            { label: "Load Rating", value: "Designed for pedestrian live loads of 400 to 500 kg/m²" }
        ]
    },
    {
        id: "net-bridges",
        name: "Net Bridges",
        image: "", // Empty for user image upload
        shortDesc: "Enclosed tunnel and V-shaped safety rope net bridges for thrilling aerial canopy crossings.",
        fullDesc: "Fun, enclosed aerial net bridges suspended high between trees, towers, or platforms. Formed with heavy braided rope mesh in full cylindrical tunnel, V-trough, or U-channel designs allowing participants to bounce and walk safely surrounded by protective netting.",
        specs: [
            { label: "Bridge Profiles", value: "Cylindrical Tunnel Bridge, V-Profile Net Bridge, U-Shaped Trough Walkway" },
            { label: "Netting Material", value: "10mm to 14mm high-tenacity UV-stabilized braided nylon/polypropylene cordage" },
            { label: "Main Tension Cables", value: "12mm to 16mm galvanized steel wire ropes inside bottom and top edges" },
            { label: "Walkway Base", value: "Interwoven high-density footbed rope or internal suspended wooden tread slats" },
            { label: "Span Lengths", value: "5m to 25m modular spans" }
        ]
    },
    {
        id: "tarzan-swings",
        name: "Tarzan Swings",
        image: "", // Empty for user image upload
        shortDesc: "Suspended pendulum rope swing launch systems with landing cargo nets and safety tethers.",
        fullDesc: "Exciting pendulum swing adventure modules where participants leap from a takeoff platform holding or attached to a suspended dynamic rope swing, arcing across a gap to latch onto a vertical cargo catch net.",
        specs: [
            { label: "Swing Rope", value: "24mm to 30mm thick braided synthetic hemp / poly-dacron grip rope with internal safety steel wire core" },
            { label: "Suspension Hardware", value: "Heavy-duty sealed bearing swivel and top shackle anchor assembly rated at 35 kN" },
            { label: "Catch Target", value: "Heavy-duty vertical cargo net with perimeter tensioning cables and lower impact mats" },
            { label: "Launch Span", value: "6m to 12m swing arc distance" },
            { label: "Safety Systems", value: "Continuous top belay lanyard or redundant safety catch line connection" }
        ]
    },
    {
        id: "adventure-park-platforms",
        name: "Adventure Park Platforms",
        image: "", // Empty for user image upload
        shortDesc: "Pre-engineered steel and timber staging platforms, takeoff hubs, and intermediate towers.",
        fullDesc: "Pre-fabricated structural staging and connection platforms for adventure parks, zipline launches, and multi-tier rope courses. Built with structural steel subframes, corrosion-resistant coatings, anti-slip decking, and integrated anchor points.",
        specs: [
            { label: "Structural Frame", value: "Heavy structural MS I-beams, hollow square sections, and diagonal bracing trusses" },
            { label: "Deck Surface", value: "Weather-treated timber, heavy FRP grating, or anti-slip diamond steel plate" },
            { label: "Safety Enclosure", value: "1.2m high steel balustrade with wire mesh infill panels and self-closing entry gates" },
            { label: "Anchor Points", value: "Certified multi-directional PPE safety anchor eyelets rated to 22 kN each" },
            { label: "Modularity", value: "Available in freestanding multi-leg tower models or tree/pole mounted collars" }
        ]
    },
    {
        id: "ground-anchors",
        name: "Ground Anchors",
        image: "", // Empty for user image upload
        shortDesc: "High-capacity earth screw anchors, duckbill percussion anchors, and concrete deadman anchor systems.",
        fullDesc: "Heavy-duty ground and earth anchoring solutions for securing guy wires, tower stay cables, suspension bridge ends, and zipline tension lines into varying soil, sand, or gravel ground conditions without extensive excavation.",
        specs: [
            { label: "Anchor Types", value: "Helical Screw Earth Anchors, Percussion Duckbill Anchors, Deadman Concrete Anchor Plates, Rock Expansion Anchors" },
            { label: "Shaft / Rod Size", value: "20mm to 32mm solid steel / heavy tube shaft with single or double helix blades" },
            { label: "Installation Depth", value: "1.5m to 4.5m deep soil penetration" },
            { label: "Holding Capacity", value: "30 kN to 150+ kN tensile pull-out resistance (depending on soil type)" },
            { label: "Corrosion Coating", value: "Hot-dip galvanized to BS EN ISO 1461 for long-term subsurface lifespan" }
        ]
    },
    {
        id: "structural-support-components",
        name: "Structural Support Components",
        image: "", // Empty for user image upload
        shortDesc: "Heavy structural MS columns, cross-bracing trusses, base plates, and connection gussets.",
        fullDesc: "Engineered structural steel fabrication components designed for assembling multi-activity towers, adventure park frames, giant swings, and canopy structures. Precision cut, welded, and drilled for modular bolt-together on-site assembly.",
        specs: [
            { label: "Components", value: "Tubular and SHS structural columns, diagonal cross-bracing ties, foundation base plates, tower apex trusses, connection gussets" },
            { label: "Steel Grades", value: "IS 2062 Grade E250 / E350 Structural Mild Steel" },
            { label: "Welding Standards", value: "Full penetration continuous welding compliant with AWS D1.1 structural welding code" },
            { label: "Protective Coating", value: "Sand-blasting to Sa 2.5, zinc-rich epoxy primer (75 microns), and dual polyurethane finish coats (100+ microns)" },
            { label: "Hardware Included", value: "High-tensile Grade 8.8 / 10.9 structural bolts, nuts, and spring washers" }
        ]
    }
];

const EQUIPMENT_IDS = [
    'open-gym-equipment',
    'climbing-wall-equipment',
    'rope-course-equipment',
    'safety-nets',
    'safety-harness-belts',
    'zipline-safety-equipment',
    'climbing-ropes',
    'carabiners-connectors',
    'belay-devices',
    'climbing-holds',
    'climbing-wall-panels',
    'climbing-wall-anchors',
    'rope-course-platforms',
    'rope-course-obstacles',
    'zipline-trolleys',
    'zipline-pulleys',
    'zipline-cables',
    'zipline-braking-systems',
    'adventure-safety-lanyards',
    'safety-helmets',
    'fall-arrest-systems',
    'rescue-equipment',
    'steel-cable-rigging-equipment',
    'anchoring-fixing-systems',
    'protective-padding',
    'adventure-park-signage-safety-boards',
    'cargo-nets',
    'tyre-obstacles',
    'balance-beams',
    'monkey-bars',
    'parallel-bars',
    'pull-up-bars',
    'horizontal-ladders',
    'rope-ladders',
    'suspension-bridges-equipment',
    'net-bridges',
    'tarzan-swings',
    'adventure-park-platforms',
    'ground-anchors',
    'structural-support-components'
];

// Curated 8 core items for homepage display representing core manufacturing and installation
const HOMEPAGE_CURATED_IDS = [
    'giant-swing',
    'zip-line',
    'zip-bike-sky-cycle',
    'wall-climbing',
    'net-climbing',
    'ninja-rope-courses',
    'multi-activity-tower',
    'rocket-ejection'
];

function normalizeCategory(categoryName) {
    if (!categoryName) return 'all';
    const str = String(categoryName).toLowerCase().trim().replace(/['"]/g, '');
    if (str === 'all' || str === '*' || str === 'all products' || str.startsWith('all')) {
        return 'all';
    }
    if (str === 'equipment' || str.includes('equipment') || str.endsWith('equipment') || str === 'activities - equipment' || str === 'activities-equipment' || str === 'equipment & rides' || str === 'adventure equipment') {
        return 'equipment';
    }
    if (str === 'activities' || str.includes('activit') || str === 'adventure activities' || str === 'rides' || str === 'adventure rides') {
        return 'activities';
    }
    return str;
}

function getProductCategory(product) {
    if (!product) return 'activities';
    if (product.category) {
        const norm = normalizeCategory(product.category);
        if (norm === 'equipment' || norm === 'activities') {
            return norm;
        }
    }
    const pid = String(product.id || '').toLowerCase().trim();
    if (pid && EQUIPMENT_IDS.some(id => id.toLowerCase().trim() === pid)) {
        return 'equipment';
    }
    return 'activities';
}

let currentCategoryFilter = 'all';

function syncFilterUI(selectedCategory) {
    const norm = normalizeCategory(selectedCategory);
    document.querySelectorAll('.btn-product-tab').forEach(btn => {
        const cat = normalizeCategory(btn.getAttribute('data-category') || 'all');
        const isActive = cat === norm;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
    });

    const dropHome = document.getElementById('productCategorySelect');
    if (dropHome) dropHome.value = norm;

    const dropPage = document.getElementById('productCategorySelectPage');
    if (dropPage) dropPage.value = norm;
}

function initProductCategoryTabs() {
    const tabs = document.querySelectorAll('.btn-product-tab');
    if (tabs && tabs.forEach) {
        tabs.forEach(btn => {
            if (!btn || typeof btn.addEventListener !== 'function') return;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const rawCat = btn.getAttribute('data-category') || 'all';
                const cat = normalizeCategory(rawCat);
                renderProductsGrid(cat);
                if (typeof history !== 'undefined' && history.replaceState && typeof window !== 'undefined' && window.location) {
                    if (cat !== 'all') {
                        history.replaceState(null, '', `#${cat}`);
                    } else {
                        history.replaceState(null, '', window.location.pathname + window.location.search);
                    }
                }
                if (typeof updateNavActiveStates === 'function') {
                    updateNavActiveStates();
                }
            });
        });
    }

    // Mobile / Dropdown Filter handlers
    [document.getElementById('productCategorySelect'), document.getElementById('productCategorySelectPage')].forEach(sel => {
        if (sel && typeof sel.addEventListener === 'function') {
            sel.addEventListener('change', () => {
                const rawCat = sel.value || 'all';
                const cat = normalizeCategory(rawCat);
                renderProductsGrid(cat);
                if (typeof history !== 'undefined' && history.replaceState && typeof window !== 'undefined' && window.location) {
                    if (cat !== 'all') {
                        history.replaceState(null, '', `#${cat}`);
                    } else {
                        history.replaceState(null, '', window.location.pathname + window.location.search);
                    }
                }
            });
        }
    });

    function handleHashCategory(shouldScroll) {
        const rawHash = (window.location.hash || '').replace(/^#/, '').toLowerCase().trim();
        if (!rawHash) return;
        const norm = normalizeCategory(rawHash);
        if (norm === 'activities' || norm === 'equipment') {
            renderProductsGrid(norm);
            if (shouldScroll) {
                scrollToProductsSection();
            }
        } else if (norm === 'all' || rawHash === 'products-catalogue' || rawHash === 'adventure-rides' || rawHash === 'products') {
            renderProductsGrid('all');
        }
    }

    function scrollToProductsSection() {
        const target = document.getElementById('products-catalogue') || document.getElementById('products') || document.getElementById('adventure-rides');
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 80);
        }
    }

    // Handle initial hash
    if (typeof window !== 'undefined' && window.location && window.location.hash) {
        handleHashCategory(true);
    }

    // Handle hash changes
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('hashchange', () => {
            handleHashCategory(true);
        });
    }
}

// Render the Product Cards (curated on homepage, full catalogue on products.html)
function renderProductsGrid(categoryFilter) {
    const gridEl = document.getElementById('productsGrid');
    if (!gridEl) return;

    if (categoryFilter) {
        currentCategoryFilter = normalizeCategory(categoryFilter);
    } else {
        currentCategoryFilter = normalizeCategory(currentCategoryFilter);
    }

    // Determine if on homepage or dedicated products catalogue page
    const isCataloguePage = Boolean(document.getElementById('products-catalogue') || document.getElementById('productCategorySelectPage'));

    let filtered = [];
    if (!isCataloguePage) {
        // Homepage behavior
        if (currentCategoryFilter === 'all') {
            // Curated 8 core items on homepage
            filtered = HOMEPAGE_CURATED_IDS
                .map(id => STARLINE_PRODUCTS.find(p => p.id.toLowerCase() === id.toLowerCase()))
                .filter(Boolean);
        } else if (currentCategoryFilter === 'activities') {
            const curatedActivities = HOMEPAGE_CURATED_IDS
                .map(id => STARLINE_PRODUCTS.find(p => p.id.toLowerCase() === id.toLowerCase() && getProductCategory(p) === 'activities'))
                .filter(Boolean);
            filtered = curatedActivities.length > 0
                ? curatedActivities
                : STARLINE_PRODUCTS.filter(p => getProductCategory(p) === 'activities').slice(0, 8);
        } else if (currentCategoryFilter === 'equipment') {
            filtered = STARLINE_PRODUCTS.filter(p => getProductCategory(p) === 'equipment');
        } else {
            filtered = STARLINE_PRODUCTS.filter(p => getProductCategory(p) === currentCategoryFilter);
        }
    } else {
        // Full products catalogue page (products.html)
        if (currentCategoryFilter === 'all') {
            filtered = STARLINE_PRODUCTS;
        } else {
            filtered = STARLINE_PRODUCTS.filter(p => getProductCategory(p) === currentCategoryFilter);
        }
    }

    // Synchronize tab buttons and dropdown
    syncFilterUI(currentCategoryFilter);

    let html = '';
    filtered.forEach((product) => {
        const cat = getProductCategory(product);
        const imgHtml = (typeof renderProductCardImage === 'function')
            ? renderProductCardImage(product)
            : ((product.image && product.image.trim() !== '')
                ? `<img src="${product.image}" alt="${escapeHtml(product.name)} - Starline Adventures" class="product-item-img" loading="lazy" decoding="async" onerror="this.onerror=null; this.parentElement.innerHTML = '<div class=\\'product-card-empty-box\\'><span class=\\'product-card-empty-icon\\' aria-hidden=\\'true\\'>📷</span><span class=\\'product-card-empty-text\\'>Image coming soon</span></div>';">`
                : `<div class="product-card-empty-box"><span class="product-card-empty-icon" aria-hidden="true">📷</span><span class="product-card-empty-text">Image coming soon</span></div>`);

        html += `
        <article class="product-item-card" id="${product.id}" data-category="${cat}">
            <div class="product-item-img-wrap">
                ${imgHtml}
            </div>
            <div class="product-item-body">
                <h3 class="product-item-title">${escapeHtml(product.name)}</h3>
                <p class="product-item-desc">${escapeHtml(product.shortDesc)}</p>
                <div class="product-item-actions">
                    <a href="product-details.html?product=${product.id}"
                       class="btn-product-info"
                       aria-label="View Info for ${escapeHtml(product.name)}">
                        View Info
                    </a>
                    <button type="button"
                            class="btn-product-enquire"
                            onclick="openProductEnquiryModal('${escapeHtml(product.name)}')"
                            aria-label="Request a Quote for ${escapeHtml(product.name)}">
                        Request a Quote
                    </button>
                </div>
            </div>
        </article>
        `;
    });

    gridEl.innerHTML = html;
}

// Master initialization function
function initProductsCatalog() {
    // Automatically resolve all product images from the centralized StarlineImageMap
    STARLINE_PRODUCTS.forEach(p => {
        if (typeof getProductImage === 'function') {
            const mapped = getProductImage(p);
            p.image = mapped || "";
        }
    });

    initProductCategoryTabs();
    renderProductsGrid();
    initModalHandlers();
    initEnquiryFormSubmission();
}

// Run immediately if DOM is ready, or listen for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductsCatalog);
} else {
    initProductsCatalog();
}

// Open Product Enquiry Modal
function openProductEnquiryModal(productName) {
    const modal = document.getElementById('productEnquiryModal');
    const productInput = document.getElementById('modalEnquiryProduct');
    const form = document.getElementById('productEnquiryForm');

    if (!modal) return;

    if (productInput) {
        productInput.value = productName || 'Adventure Equipment';
    }

    if (form) {
        const statusEl = form.querySelector('.form-status');
        if (statusEl) {
            statusEl.textContent = '';
            statusEl.className = 'form-status';
        }
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus on first input
    setTimeout(() => {
        document.getElementById('modalEnquiryName')?.focus();
    }, 150);
}

// Close Product Enquiry Modal
function closeProductEnquiryModal() {
    const modal = document.getElementById('productEnquiryModal');
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

// Set up modal listeners
function initModalHandlers() {
    const enqClose = document.getElementById('productEnquiryClose');
    const enqBackdrop = document.getElementById('productEnquiryBackdrop');

    if (enqClose && typeof enqClose.addEventListener === 'function') enqClose.addEventListener('click', closeProductEnquiryModal);
    if (enqBackdrop && typeof enqBackdrop.addEventListener === 'function') enqBackdrop.addEventListener('click', closeProductEnquiryModal);

    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeProductEnquiryModal();
            }
        });
    }
}

// Handle Modal Enquiry Form Submission
function initEnquiryFormSubmission() {
    const form = document.getElementById('productEnquiryForm');
    if (!form || typeof form.addEventListener !== 'function') return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const statusEl = form.querySelector('.form-status');
        const submitBtn = form.querySelector('button[type="submit"]');

        const nameInput = document.getElementById('modalEnquiryName');
        const emailInput = document.getElementById('modalEnquiryEmail');
        const phoneInput = document.getElementById('modalEnquiryPhone');
        const locationInput = document.getElementById('modalEnquiryLocation');
        const productInput = document.getElementById('modalEnquiryProduct');
        const messageInput = document.getElementById('modalEnquiryMessage');

        const name = nameInput?.value.trim();
        const email = emailInput?.value.trim();
        const phone = phoneInput?.value.trim();
        const location = locationInput?.value.trim();
        const product = productInput?.value.trim() || 'Adventure Equipment';
        const message = messageInput?.value.trim();

        if (!name || !email || !phone || !location || !message) {
            if (statusEl) {
                statusEl.className = 'form-status error';
                statusEl.textContent = '❌ Please fill in all required fields.';
            }
            return;
        }

        if (statusEl) {
            statusEl.className = 'form-status loading';
            statusEl.textContent = '⏳ Sending your enquiry to our engineering team...';
        }

        if (submitBtn) submitBtn.disabled = true;

        const payload = {
            name,
            email,
            phone,
            location,
            product,
            message,
            formType: 'Product Enquiry'
        };

        const apiUrl = (typeof STARLINE_CONFIG !== 'undefined' && STARLINE_CONFIG?.enquiryApiUrl) || '/api/enquiry';

        try {
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok && data.success !== false) {
                closeProductEnquiryModal();
                form.reset();

                const enquiryId = data.enquiryId || data.id || ('SA-ENQ-' + Math.floor(100000 + Math.random() * 900000));

                if (typeof showEnquirySuccessModal === 'function') {
                    showEnquirySuccessModal({
                        id: enquiryId,
                        name,
                        product,
                        location,
                        phone,
                        customerMessage: data.customerMessage || "Thank you for choosing Starline Adventures! We have successfully received your enquiry. Our team will review your requirements and get in touch with you shortly. We appreciate your interest and look forward to working with you."
                    });
                } else {
                    alert(`Enquiry submitted successfully! Reference ID: ${enquiryId}`);
                }
            } else {
                throw new Error(data.error || data.message || 'Submission failed. Please try again.');
            }
        } catch (err) {
            console.error('Product enquiry error:', err);
            if (statusEl) {
                statusEl.className = 'form-status error';
                statusEl.textContent = `❌ ${err.message || 'Unable to submit enquiry. Please call us or message on WhatsApp.'}`;
            }
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
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

window.STARLINE_PRODUCTS = STARLINE_PRODUCTS;
window.renderProductsGrid = renderProductsGrid;
window.initProductsCatalog = initProductsCatalog;
window.getProductCategory = getProductCategory;
window.normalizeCategory = normalizeCategory;
window.openProductEnquiryModal = openProductEnquiryModal;
window.closeProductEnquiryModal = closeProductEnquiryModal;

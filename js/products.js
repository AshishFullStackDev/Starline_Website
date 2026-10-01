// STARLINE ADVENTURES - CENTRAL PRODUCT DATA
// Central source of truth for products catalog, search, and navigation

const products = [
    {
        "name": "Zipline",
        "slug": "zipline",
        "url": "/product/zipline.html",
        "category": "Adventure Rides",
        "image": "/images/zipline_square.jpeg",
        "fallbackImage": "/images/zipline_square.jpeg",
        "altText": "Commercial Zipline manufactured and installed by Starline Adventures in India",
        "shortDesc": "A classic overhead zip line that carries riders on a cable run through the site.",
        "fullDesc": "Engineered to international safety standards, Starline zip lines connect takeoff and landing platforms with heavy-duty galvanized wire ropes, enabling participants to glide at high speeds across nature canopies, lakes, and rugged terrain.",
        "specs": [
            {
                "label": "Age Group",
                "value": "6 years & above"
            },
            {
                "label": "Installation Type",
                "value": "Outdoor Nature Park / Resort / Hill Station"
            },
            {
                "label": "Weight Capacity",
                "value": "Max 110 kg per rider"
            },
            {
                "label": "Span Length",
                "value": "50m to 1000m+ customized span"
            },
            {
                "label": "Materials & Components",
                "value": "Mild steel launch/landing towers, Usha Martin galvanized wire rope, tiger U-clamps, thimbles, turnbuckles, tandem high-speed ball-bearing pulleys, zip stopper brake, seat/full-body harnesses, helmets."
            }
        ]
    },
    {
        "name": "Giant Swing",
        "slug": "giant-swing",
        "url": "/product/giant-swing.html",
        "category": "Adventure Rides",
        "image": "/images/products/giant-swing/giant-swing.jpeg",
        "fallbackImage": "/images/Giant swing.jpeg",
        "altText": "Commercial Giant Swing manufactured and installed by Starline Adventures in India",
        "shortDesc": "Massive A-frame pendulum swing providing exhilarating free-fall release and wide weightless arcs.",
        "fullDesc": "The Giant Swing hoists 2 to 4 riders to great heights before an instantaneous mechanical release drops them in a high-speed pendulum swing over open valleys or resort grounds, offering unmatched weightless thrills.",
        "specs": [
            {
                "label": "Age Group",
                "value": "10 years & above"
            },
            {
                "label": "Installation Type",
                "value": "Outdoor / Cliff / Open Ground"
            },
            {
                "label": "Participant Capacity",
                "value": "2 to 4 persons simultaneously"
            },
            {
                "label": "Tower Height Options",
                "value": "40ft / 50ft / 60ft / 70ft / 100ft"
            },
            {
                "label": "Materials & Components",
                "value": "Heavy MS structural frame, 3HP industrial gearbox and brake motor, remote console, modified multi-rider swing harness, alloy/iron carabiners, 12mm galvanised wire rope, quick-release lock, U-clamps, pedestal bearings."
            }
        ]
    },
    {
        "name": "Suspension Bridge",
        "slug": "suspension-bridge",
        "url": "/product/suspension-bridge.html",
        "category": "Adventure Equipment",
        "image": "/images/products/suspension-bridge/suspension-bridge.jpg",
        "fallbackImage": "/images/suspension bridge.jpg",
        "altText": "Commercial Suspension Bridge manufactured and installed by Starline Adventures in India",
        "shortDesc": "A swaying rope-and-plank bridge for crossing valleys and rivers.",
        "fullDesc": "A classic adventure walkway suspended across gorges, water bodies, or tree canopies. Built with heavy-gauge galvanized main cables, anti-slip decking, and high-tensile safety netting for a scenic, gently swaying crossing.",
        "specs": [
            {
                "label": "Age Group",
                "value": "All age groups"
            },
            {
                "label": "Installation Type",
                "value": "Outdoor Landscape / River Crossing"
            },
            {
                "label": "Capacity",
                "value": "50 to 80 persons simultaneously"
            },
            {
                "label": "Dimensions",
                "value": "50ft to 500ft length x 6ft width"
            },
            {
                "label": "Materials & Components",
                "value": "Galvanized steel wire ropes, tiger U-clamps, mild steel anchor frames, weather-treated wooden/composite decking planks, metal wire protection mesh, thimbles, turnbuckles."
            }
        ]
    },
    {
        "name": "Climbing Wall",
        "slug": "climbing-wall",
        "url": "/product/climbing-wall.html",
        "category": "Adventure Rides",
        "image": "/images/products/climbing-wall/climbing-wall.jpeg",
        "fallbackImage": "/images/wall_climbing_square.jpeg",
        "altText": "Commercial Artificial Climbing Wall manufactured and installed by Starline Adventures in India",
        "shortDesc": "A textured climbing panel with holds set in a colour and layout of your choice.",
        "fullDesc": "Custom-manufactured climbing walls built for high durability and authentic feel. Available in rock-realistic FRP textures and vibrant bouldering modular setups with auto-belays and multi-pitch safety anchors.",
        "specs": [
            {
                "label": "Age Group",
                "value": "6 years & above"
            },
            {
                "label": "Installation Type",
                "value": "Outdoor / Indoor Facility"
            },
            {
                "label": "Lane Capacity",
                "value": "Max 110 kg per lane"
            },
            {
                "label": "Wall Height",
                "value": "20ft to 50ft+ (Customized)"
            },
            {
                "label": "Materials & Components",
                "value": "Heavy structural MS framework, heavy-grade FRP climbing panels, ergonomic modular climbing holds, high-tension fasteners, static and dynamic climbing ropes, auto-belay / GRI-GRI devices, harnesses, safety landing mats."
            }
        ]
    },
    {
        "name": "Sky Cycling",
        "slug": "sky-cycling",
        "url": "/product/sky-cycling.html",
        "category": "Adventure Rides",
        "image": "/images/sky_cycle_square.jpeg",
        "fallbackImage": "/images/sky_cycle_square.jpeg",
        "altText": "Aerial Sky Cycling and Zip Bike manufactured and installed by Starline Adventures in India",
        "shortDesc": "A cycle suspended from an overhead cable, letting riders pedal high above the ground.",
        "fullDesc": "Participants pedal specially modified aerodynamic bicycles across elevated overhead cable lines. Engineered with counterweights and redundant safety tethers to provide a smooth, exhilarating, self-balancing aerial ride.",
        "specs": [
            {
                "label": "Age Group",
                "value": "10 years & above"
            },
            {
                "label": "Installation Type",
                "value": "Indoor / Outdoor Aerial Circuit"
            },
            {
                "label": "Weight Capacity",
                "value": "Max 110 kg"
            },
            {
                "label": "Configurations",
                "value": "Single cycle · Double cycle · Two-way reciprocal line"
            },
            {
                "label": "Materials & Components",
                "value": "Mild steel terminal frames, galvanized wire ropes, tiger U-clamps, turnbuckles, alloy-wheel sports cycles, 360° rotating harness connector, safety seat belts, helmets, tandem pulleys, dynamic rope slings."
            }
        ]
    },
    {
        "name": "Trampoline Park",
        "slug": "trampoline-park",
        "url": "/product/trampoline-park.html",
        "category": "Adventure Rides",
        "image": "/images/products/trampoline-park/trampoline-park.jpeg",
        "fallbackImage": "/images/trampoline.jpeg",
        "altText": "Commercial Trampoline Park and Bungee Arenas manufactured and installed by Starline Adventures in India",
        "shortDesc": "Commercial heavy-duty adventure trampoline and bungee flip arena for all age groups.",
        "fullDesc": "Commercial grade high-bounce adventure trampolines and multi-station bungee jumping setups designed for resorts, adventure parks, and amusement destinations. Engineered with reinforced tubular steel frames, heavy-gauge steel springs, UV-resistant jump mats, and 360° padded enclosure nets.",
        "specs": [
            {
                "label": "Age Group",
                "value": "4 years & above"
            },
            {
                "label": "Installation Type",
                "value": "Indoor Arena / Outdoor Adventure Park"
            },
            {
                "label": "Capacity",
                "value": "Single to multi-station trampoline arenas (Max 100 kg per jumper)"
            },
            {
                "label": "Dimensions",
                "value": "Custom modular sizes from 10ft round to multi-bay continuous arenas"
            },
            {
                "label": "Materials & Components",
                "value": "Heavy galvanized steel tubular frame, high-tensile carbon steel springs, polypropylene UV-stabilized jumping mat, 20mm high-density safety padding, safety enclosure net with steel uprights."
            }
        ]
    },
    {
        "name": "4 in 1 Bungee Jumping",
        "slug": "bungee-jumping",
        "url": "/product/bungee-jumping.html",
        "category": "Adventure Rides",
        "image": "/images/products/bungee-jumping/bungee-jumping.jpeg",
        "fallbackImage": "/images/trampoline.jpeg",
        "altText": "Commercial 4 in 1 Bungee Jumping manufactured and installed by Starline Adventures in India",
        "shortDesc": "Four-station bungee trampolines that let a group bounce and flip together.",
        "fullDesc": "A high-throughput crowd favorite for amusement parks and family entertainment zones. Four motorized winch stations combined with elastic bungee cords allow jumpers to achieve heights up to 25 feet and execute flips safely.",
        "specs": [
            {
                "label": "Age Group",
                "value": "6 to 15 years & adults"
            },
            {
                "label": "Installation Type",
                "value": "Outdoor / Indoor Arena"
            },
            {
                "label": "Capacity",
                "value": "4 simultaneous jumpers (Max 80 kg each)"
            },
            {
                "label": "Footprint",
                "value": "35ft x 35ft"
            },
            {
                "label": "Materials & Components",
                "value": "3-phase electric brake motors, worm gearbox, central remote control panel, single pulleys, alloy carabiners, static ropes, heavy bungee cords, full-body harnesses, commercial trampolines with safety branding covers."
            }
        ]
    },
    {
        "name": "Human Gyro Ride",
        "slug": "human-gyro-ride",
        "url": "/product/human-gyro-ride.html",
        "category": "Adventure Rides",
        "image": "/images/products/human-gyro-ride/human-gyro-ride.jpeg",
        "fallbackImage": "/images/gyro_square.jpeg",
        "altText": "Commercial Human Gyro Ride manufactured and installed by Starline Adventures in India",
        "shortDesc": "A rotating gyroscope ride that spins seated riders through 360° in every direction.",
        "fullDesc": "Modeled after space simulation and aerospace pilot training systems, the Human Gyro rotates riders freely across three concentric axes. Gives riders an incredible sensation of weightlessness and 3D rotational motion in total safety.",
        "specs": [
            {
                "label": "Age Group",
                "value": "8 years & above"
            },
            {
                "label": "Installation Type",
                "value": "Indoor / Outdoor"
            },
            {
                "label": "Seater Capacity",
                "value": "2-Seater (200 kg) up to 6-Seater (600 kg)"
            },
            {
                "label": "Footprint",
                "value": "8ft x 15ft"
            },
            {
                "label": "Materials & Components",
                "value": "Heavy MS tubular concentric rings, foam padded bucket seats, 3HP gearbox with electric motor and control panel, high-tension fasteners, 4-point safety harnesses, PU/powder-coated anti-rust finish."
            }
        ]
    },
    {
        "name": "Rocket Ejection",
        "slug": "rocket-ejection",
        "url": "/product/rocket-ejection.html",
        "category": "Adventure Rides",
        "image": "/images/products/rocket-ejection/rocket-ejection.jpeg",
        "fallbackImage": "/images/ejector_square.jpeg?v=2",
        "altText": "Rocket Ejection and Reverse Bungee Catapult manufactured and installed by Starline Adventures in India",
        "shortDesc": "High-altitude twin-tower reverse bungee catapult launching riders skyward with intense thrill.",
        "fullDesc": "The Rocket Ejection is a flagship high-altitude thrill attraction. Using heavy-gauge tensioned bungee cords and automated launch winches between structural steel towers, riders are propelled rapidly skyward to experience intense vertical acceleration and breathtaking zero-gravity freefall.",
        "specs": [
            {
                "label": "Age Group",
                "value": "10 years & above"
            },
            {
                "label": "Installation Type",
                "value": "Outdoor Destination / Theme Park"
            },
            {
                "label": "Weight Capacity",
                "value": "Max 100 kg per rider"
            },
            {
                "label": "Footprint / Dimensions",
                "value": "15ft (W) x 30ft (L) x 42ft (H)"
            },
            {
                "label": "Materials & Components",
                "value": "Metallic structural steel, 3-phase electric brake motor, worm gearbox & remote control console, drum, pedestal bearing, 12mm bungee cord, 12mm static rope, alloy/steel carabiners, ejection hook, harness, helmet, wire ropes."
            }
        ]
    },
    {
        "name": "Sky Roller Ride",
        "slug": "sky-roller-ride",
        "url": "/product/sky-roller-ride.html",
        "category": "Adventure Rides",
        "image": "/images/products/sky-roller-ride/sky-roller-ride.jpeg",
        "fallbackImage": "/images/sky_roller_square.jpeg",
        "altText": "Commercial Sky Roller Ride manufactured and installed by Starline Adventures in India",
        "shortDesc": "A rolling wheel-cage that carries a rider along an elevated cable line.",
        "fullDesc": "A distinctive aerial motion attraction where participants step inside a rolling cylindrical capsule that glides suspended on high-tension wire ropes, delivering rotating views and smooth forward momentum.",
        "specs": [
            {
                "label": "Age Group",
                "value": "10 years & above"
            },
            {
                "label": "Installation Type",
                "value": "Outdoor Adventure Park"
            },
            {
                "label": "Weight Capacity",
                "value": "Max 110 kg"
            },
            {
                "label": "Track Span",
                "value": "50m to 200m"
            },
            {
                "label": "Materials & Components",
                "value": "Mild steel rolling cage structure, galvanized high-tension wire rope, tiger U-clamps, thimbles, tandem safety pulleys, harness system, safety helmet, impact buffers."
            }
        ]
    },
    {
        "name": "Net Climbing",
        "slug": "net-climbing",
        "url": "/product/net-climbing.html",
        "category": "Adventure Rides",
        "image": "/images/products/net-climbing/net-climbing.jpeg",
        "fallbackImage": "/images/Net_Climbing.jpeg",
        "altText": "Commercial Net Climbing manufactured and installed by Starline Adventures in India",
        "shortDesc": "A tensioned rope net for riders to climb up, across or through.",
        "fullDesc": "Constructed with industrial-strength braided nylon and steel-core ropes, Net Climbing develops physical coordination, agility, and stamina. Can be mounted vertically or diagonally across towers and obstacle arenas.",
        "specs": [
            {
                "label": "Age Group",
                "value": "6 years & above"
            },
            {
                "label": "Installation Type",
                "value": "Outdoor / Adventure Tower"
            },
            {
                "label": "Capacity",
                "value": "Continuous multi-user flow"
            },
            {
                "label": "Dimensions",
                "value": "Tailored to tower or frame dimensions"
            },
            {
                "label": "Materials & Components",
                "value": "Mild steel framework, UV-resistant braided nylon cargo netting, steel wire ropes, U-clamps, static ropes, harnesses, helmets, carabiners."
            }
        ]
    },
    {
        "name": "Rope Course",
        "slug": "rope-course",
        "url": "/product/rope-course.html",
        "category": "Adventure Rides",
        "image": "/images/products/rope-course/rope-course.jpeg",
        "fallbackImage": "/images/rope_course_square.jpeg",
        "altText": "Commercial Multi-Level Rope Challenge Course manufactured and installed by Starline Adventures in India",
        "shortDesc": "A multi-level obstacle rig of ropes, nets and beams inspired by ninja-warrior courses.",
        "fullDesc": "A modular, multi-tier aerial obstacle course featuring a continuous safety belay lifeline. Participants navigate suspended bridges, swinging logs, rope webs, balance beams, and cargo nets designed for high guest throughput.",
        "specs": [
            {
                "label": "Age Group",
                "value": "6 years & above"
            },
            {
                "label": "Installation Type",
                "value": "Indoor / Outdoor"
            },
            {
                "label": "Throughput",
                "value": "Continuous multi-user capacity (20-60 users/hr)"
            },
            {
                "label": "Course Levels",
                "value": "1, 2 or 3 elevated tiers"
            },
            {
                "label": "Materials & Components",
                "value": "Structural steel support columns, FRP elements, treated hardwood planks, steel wire ropes, turnbuckles, thimbles, continuous belay track, certified harnesses, helmets."
            }
        ]
    },
    {
        "name": "Multi Activity Tower",
        "slug": "multi-activity-tower",
        "url": "/product/multi-activity-tower.html",
        "category": "Adventure Rides",
        "image": "/images/products/multi-activity-tower/multi-activity-tower.jpeg",
        "fallbackImage": "/images/tower_square.jpeg",
        "altText": "Commercial Multi Activity Adventure Tower manufactured and installed by Starline Adventures in India",
        "shortDesc": "A layered adventure tower combining climbs, nets, swings and zip elements in one structure.",
        "fullDesc": "The Multi Activity Tower consolidates 4 to 8 popular adventure activities into a single compact footprint. Accommodates wall climbing, rappelling, zipline takeoff, net climb, and quick-jump freefall from a centralized steel structure.",
        "specs": [
            {
                "label": "Age Group",
                "value": "6 years & above"
            },
            {
                "label": "Installation Type",
                "value": "Outdoor Adventure Park / Resort"
            },
            {
                "label": "Simultaneous Users",
                "value": "20 to 30 participants at once"
            },
            {
                "label": "Tower Height",
                "value": "35ft to 60ft"
            },
            {
                "label": "Materials & Components",
                "value": "Heavy structural MS lattice framework, corrosion-resistant coating, modular activity platforms, certified anchor brackets, safety railings, wire ropes, turnbuckles, PPE harnesses, helmets."
            }
        ]
    },
    {
        "name": "Glass Bridge",
        "slug": "glass-bridge",
        "url": "/product/glass-bridge.html",
        "category": "Adventure Rides",
        "image": "/images/products/glass-bridge/glass-bridge.jpg",
        "fallbackImage": "/images/glass_square.jpg",
        "altText": "Commercial Glass Skywalk Bridge manufactured and installed by Starline Adventures in India",
        "shortDesc": "A see-through glass walkway suspended across a gap or canyon.",
        "fullDesc": "A spectacular engineering marvel and tourist magnet. Constructed with triple-layer toughened laminated safety glass and heavy-duty structural steel trusses, offering visitors breathtaking views directly beneath their feet.",
        "specs": [
            {
                "label": "Age Group",
                "value": "All ages (5 years & above)"
            },
            {
                "label": "Installation Type",
                "value": "Outdoor Valley / Hill / Resort"
            },
            {
                "label": "Guest Capacity",
                "value": "50 to 100+ visitors at once"
            },
            {
                "label": "Bridge Span",
                "value": "20m to 150m+ (Site tailored)"
            },
            {
                "label": "Materials & Components",
                "value": "High-grade structural steel trusses, toughened laminated multi-layer sandwich glass panels, galvanised stay wire ropes, turnbuckles, stainless steel safety balustrades and handrails."
            }
        ]
    },
    {
        "name": "360 Degree Cycle",
        "slug": "360-degree-cycle",
        "url": "/product/360-degree-cycle.html",
        "category": "Adventure Rides",
        "image": "/images/products/360-degree-cycle/360-degree-cycle.jpeg",
        "fallbackImage": "/images/360_square.jpeg",
        "altText": "360 Degree Inverted Cycle manufactured and installed by Starline Adventures in India",
        "shortDesc": "A single wheel-frame cycle that lets riders pedal a full vertical loop.",
        "fullDesc": "Riders pedal a counterbalanced sports bicycle inside a vertical circular steel loop, generating kinetic energy to complete a full 360-degree loop-the-loop inversion safely locked to the circular rail.",
        "specs": [
            {
                "label": "Age Group",
                "value": "8 years to adults (up to 80 kg)"
            },
            {
                "label": "Installation Type",
                "value": "Outdoor / Indoor Adventure Zone"
            },
            {
                "label": "Weight Capacity",
                "value": "Max 80 kg"
            },
            {
                "label": "Dimensions",
                "value": "6ft (W) x 10ft (L) x 12ft (H)"
            },
            {
                "label": "Materials & Components",
                "value": "Metallic circular steel structure, alloy-wheel sports bicycle, anti-corrosion powder coating, high-tension nuts & bolts, specially modified full-body harness, safety helmet, counterweight assembly."
            }
        ]
    },
    {
        "name": "Mechanical Bull Ride",
        "slug": "mechanical-bull-ride",
        "url": "/product/mechanical-bull-ride.html",
        "category": "Adventure Rides",
        "image": "/images/products/mechanical-bull-ride/mechanical-bull-ride.jpeg",
        "fallbackImage": "/images/Bull_ride.jpeg",
        "altText": "Commercial Mechanical Bull Ride manufactured and installed by Starline Adventures in India",
        "shortDesc": "A mechanical rodeo bull set on a cushioned inflatable ring.",
        "fullDesc": "The ultimate carnival and party attraction. Features a realistic bucking and spinning mechanical bull with dual-axis motorized movement and multiple operator speed settings, surrounded by a cushioned commercial inflatable arena.",
        "specs": [
            {
                "label": "Age Group",
                "value": "7 years & above"
            },
            {
                "label": "Installation Type",
                "value": "Indoor / Outdoor"
            },
            {
                "label": "Rider Capacity",
                "value": "Max 90-100 kg (1 rider at a time)"
            },
            {
                "label": "Dimensions",
                "value": "16ft diameter ring, 2ft height"
            },
            {
                "label": "Materials & Components",
                "value": "Metallic steel chassis, 460 GSM commercial SRF inflatable base, heavy-grade FRP bull body with leather saddle, single-phase motor with dual-axis gearbox, digital control console, high-output air blower."
            }
        ]
    },
    {
        "name": "Rifle Shooting Range",
        "slug": "rifle-shooting-range",
        "url": "/product/rifle-shooting-range.html",
        "category": "Adventure Rides",
        "image": "/images/products/rifle-shooting-range/rifle-shooting-range.jpeg",
        "fallbackImage": "/images/Rifale_shooting.jpeg",
        "altText": "Commercial Target Rifle Shooting Range Setup manufactured and installed by Starline Adventures in India",
        "shortDesc": "A dedicated target range for precision shooting with air rifles.",
        "fullDesc": "A supervised skill range featuring target backdrops, pellet-catch boxes, and individual lane dividers. Engineered with strict ballistic safety containment for engaging resort target sports.",
        "specs": [
            {
                "label": "Age Group",
                "value": "10 years & above"
            },
            {
                "label": "Installation Type",
                "value": "Indoor / Outdoor Range"
            },
            {
                "label": "Lane Capacity",
                "value": "2 to 6 shooting lanes"
            },
            {
                "label": "Range Distance",
                "value": "10-meter standard target distance"
            },
            {
                "label": "Materials & Components",
                "value": "Calibre 0.177 target air rifles, steel pellet-catcher target boxes, safety lane partitions, heavy-duty ballistic safety backstop curtains, safety shooting glasses."
            }
        ]
    },
    {
        "name": "Archery Range",
        "slug": "archery-range",
        "url": "/product/archery-range.html",
        "category": "Adventure Rides",
        "image": "/images/products/archery-range/archery-range.jpeg",
        "fallbackImage": "/images/Archery.jpeg",
        "altText": "Commercial Archery Range Setup manufactured and installed by Starline Adventures in India",
        "shortDesc": "A traditional bow-and-arrow range for testing focus and accuracy.",
        "fullDesc": "A complete archery range solution equipped with lightweight recurve and compound bows, safe fiberglass arrows, high-density layered foam and straw target stands, and perimeter safety backdrop netting.",
        "specs": [
            {
                "label": "Age Group",
                "value": "8 years & above"
            },
            {
                "label": "Installation Type",
                "value": "Outdoor / Indoor"
            },
            {
                "label": "Lane Capacity",
                "value": "2 to 6 target lanes"
            },
            {
                "label": "Range Distance",
                "value": "5m to 20m shooting distances"
            },
            {
                "label": "Materials & Components",
                "value": "Recurve & compound bows (15-25 lbs draw weight), safety fiberglass target arrows, high-density layered target bosses with stands, arm guards, finger tabs, safety arrow-stop netting."
            }
        ]
    },
    {
        "name": "Open Gym Equipment",
        "slug": "open-gym-equipment",
        "url": "/product/open-gym-equipment.html",
        "category": "Adventure Equipment",
        "image": "/images/products/open-gym-equipment/open-gym-equipment.jpeg",
        "fallbackImage": "/images/equipment/Open Gym Equipment.jpeg",
        "altText": "Commercial Outdoor Open Gym Equipment manufactured and supplied by Starline Adventures in India",
        "shortDesc": "Heavy-duty outdoor fitness and workout stations for public parks, resorts, and open-air recreational spaces.",
        "fullDesc": "High-durability commercial outdoor open gym and fitness stations designed for all age groups. Built with heavy-gauge galvanized mild steel pipes, anti-corrosive powder coating, self-lubricating nylon bearings, and ergonomic handles to withstand harsh outdoor weather conditions.",
        "specs": [
            {
                "label": "Age Group",
                "value": "12 years & above"
            },
            {
                "label": "Installation Type",
                "value": "Outdoor Parks / Resorts / Residential Campuses"
            },
            {
                "label": "Available Stations",
                "value": "Air Walker, Chest Press, Lat Pull-Down, Shoulder Builder, Twister, Leg Press, Sit-up Bench, Cross Trainer"
            },
            {
                "label": "Materials & Coating",
                "value": "Heavy-gauge galvanized MS pipe (B-Class), zinc primer, UV-resistant dual-layer powder coating, stainless steel fasteners"
            },
            {
                "label": "Mounting",
                "value": "Reinforced RCC pedestal / concrete footing ground anchoring"
            }
        ]
    },
    {
        "name": "Climbing Wall Equipment",
        "slug": "climbing-wall-equipment",
        "url": "/product/climbing-wall-equipment.html",
        "category": "Adventure Equipment",
        "image": "/images/products/climbing-wall-equipment/climbing-wall-equipment.jpeg",
        "fallbackImage": "/images/equipment/Climbing Wall Equipment.jpeg",
        "altText": "Commercial Climbing Wall Equipment and Belay Systems supplied by Starline Adventures in India",
        "shortDesc": "Professional hardware, modular holds, safety belay devices, and mounting accessories for artificial climbing walls.",
        "fullDesc": "Comprehensive commercial equipment and hardware packages for artificial rock climbing walls and bouldering facilities. Includes ergonomic textured modular holds, high-tensile T-nuts and socket cap bolts, magnetic/hydraulic auto-belay units, dynamic climbing ropes, and safety padding.",
        "specs": [
            {
                "label": "Application",
                "value": "Indoor / Outdoor Artificial Climbing Walls & Bouldering Arenas"
            },
            {
                "label": "Components Included",
                "value": "Modular climbing holds (Jugs, Pinches, Slopers, Crimps), stainless steel M10 T-nuts & bolts, top anchors, auto-belay devices"
            },
            {
                "label": "Compliance",
                "value": "CE / EN 12572 compliant climbing wall hardware"
            },
            {
                "label": "Safety Ratings",
                "value": "Anchor stations rated up to 25 kN minimum breaking strength"
            },
            {
                "label": "Material",
                "value": "High-friction UV-stabilized polyurethane composite resin, grade 8.8 / 304 stainless steel hardware"
            }
        ]
    },
    {
        "name": "Rope Course Equipment",
        "slug": "rope-course-equipment",
        "url": "/product/rope-course-equipment.html",
        "category": "Adventure Equipment",
        "image": "/images/products/rope-course-equipment/rope-course-equipment.webp",
        "fallbackImage": "/images/equipment/Rope Course Equipment.webp",
        "altText": "Commercial Rope Course Equipment and Continuous Belay Hardware supplied by Starline Adventures in India",
        "shortDesc": "Certified continuous belay lifelines, trolleys, clamps, harnesses, and hardware for high & low rope obstacle courses.",
        "fullDesc": "Specialized rigging hardware and safety components engineered for high and low aerial rope challenge courses. Features continuous belay lifeline track trolleys, zinc-plated heavy-duty turnbuckles, galvanized steel wire ropes, forged wire rope clamps, heavy-duty thimbles, and safety tethers.",
        "specs": [
            {
                "label": "Application",
                "value": "High Rope & Low Rope Obstacle Courses / Aerial Adventure Parks"
            },
            {
                "label": "Included Hardware",
                "value": "Continuous belay trolleys, heavy galvanized wire ropes (10mm-16mm), drop-forged turnbuckles, wire rope clips, thimbles, safety slings"
            },
            {
                "label": "Load Ratings",
                "value": "Minimum 22 kN to 30 kN safety rated hardware components"
            },
            {
                "label": "Weather Protection",
                "value": "Hot-dip galvanized & marine-grade anti-corrosive rust protection"
            },
            {
                "label": "Compliance",
                "value": "Conforms to EN 15567 aerial adventure park safety standards"
            }
        ]
    },
    {
        "name": "Safety Nets",
        "slug": "safety-nets",
        "url": "/product/safety-nets.html",
        "category": "Adventure Equipment",
        "image": "/images/products/safety-nets/safety-nets.jpeg",
        "fallbackImage": "/images/equipment/Safety Nets.jpeg",
        "altText": "Commercial High-Tensile Adventure Safety Nets manufactured and supplied by Starline Adventures in India",
        "shortDesc": "High-tensile UV-stabilized nylon and polypropylene safety fall-arrest and debris containment nets.",
        "fullDesc": "Heavy-duty industrial and adventure-grade safety catch nets engineered for fall protection under rope courses, zip lines, suspension bridges, trampolines, and climbing structures. Made from knotted or knotless high-tenacity UV-stabilized nylon/polypropylene cordage with reinforced perimeter border ropes.",
        "specs": [
            {
                "label": "Application",
                "value": "Fall protection under rope courses, bridges, zipline landing zones, and elevated platforms"
            },
            {
                "label": "Cord Material",
                "value": "High-tenacity UV-stabilized Polyamide / Polypropylene braided rope"
            },
            {
                "label": "Mesh Size & Thickness",
                "value": "40mm to 100mm mesh square aperture; 4mm to 8mm cord diameter"
            },
            {
                "label": "Border Rope",
                "value": "12mm - 16mm high-strength braided border rope with reinforced corner loops"
            },
            {
                "label": "Impact Resistance",
                "value": "Tested for heavy drop loads with high energy absorption and weather resistance"
            }
        ]
    },
    {
        "name": "Safety Harness & Belts",
        "slug": "safety-harness-belts",
        "url": "/product/safety-harness-belts.html",
        "category": "Adventure Equipment",
        "image": "/images/products/safety-harness-belts/safety-harness-belts.jpg",
        "fallbackImage": "/images/equipment/Safety Harness & Belts.jpg",
        "altText": "Commercial Safety Harness and Belts supplied by Starline Adventures in India",
        "shortDesc": "Full-body and sit safety harnesses with adjustable padded straps and high-tensile alloy attachment points.",
        "fullDesc": "Ergonomically designed commercial full-body and sit-in safety harnesses engineered for maximum comfort, security, and quick adjustment during adventure park operations. Fitted with heavy-duty polyester webbing, forged alloy steel D-rings, self-locking rapid-adjust buckles, and breathable padding.",
        "specs": [
            {
                "label": "Harness Types",
                "value": "Full-Body Adventure Harness, Sit / Seat Harness, Chest Harness, Kids Harness"
            },
            {
                "label": "Webbing Material",
                "value": "High-tenacity 44mm/45mm polyester webbing with high abrasion resistance"
            },
            {
                "label": "Breaking Strength",
                "value": "Rated to 22 kN (2200 kg) breaking load capacity"
            },
            {
                "label": "Fasteners & Rings",
                "value": "Forged alloy steel dorsal & ventral attachment D-rings with corrosion-resistant finish"
            },
            {
                "label": "Standards & Certification",
                "value": "CE / EN 361, EN 12277, IS 3521 certified for adventure sports and fall arrest"
            }
        ]
    },
    {
        "name": "Zipline Equipment",
        "slug": "zipline-equipment",
        "url": "/product/zipline-equipment.html",
        "category": "Adventure Equipment",
        "image": "/images/products/zipline-equipment/zipline-equipment.webp",
        "fallbackImage": "/images/equipment/Zipline Equipment.webp",
        "altText": "Commercial Zipline Equipment, Pulleys, and Brake Blocks supplied by Starline Adventures in India",
        "shortDesc": "Commercial high-speed tandem wire-rope trolleys, spring brakes, zipline cables, pulleys, and impact deceleration systems.",
        "fullDesc": "Complete commercial zipline hardware, rigging, and safety deceleration packages. Includes precision sealed-bearing tandem stainless steel trolleys, aircraft-grade galvanized steel wire ropes, multi-stage spring impact banks, bungee deceleration return catches, and secondary backup safety tethers.",
        "specs": [
            {
                "label": "Cable Compatibility",
                "value": "8mm to 16mm high-tensile galvanized / stainless steel wire ropes"
            },
            {
                "label": "Key Components",
                "value": "Dual-sheave sealed-bearing trolleys, progressive compression spring buffers, tandem pulleys, impact brake catch blocks"
            },
            {
                "label": "Speed Rating",
                "value": "Precision high-RPM bearings certified for speeds up to 100 km/h (28 m/s)"
            },
            {
                "label": "Breaking Strength",
                "value": "Minimum 25 kN to 40 kN breaking capacity on all load-bearing components"
            },
            {
                "label": "Standards",
                "value": "CE EN 12278 & ACCT commercial zipline standards compliant"
            }
        ]
    },
    {
        "name": "Climbing Ropes & Carabiners",
        "slug": "climbing-ropes-carabiners",
        "url": "/product/climbing-ropes-carabiners.html",
        "category": "Adventure Equipment",
        "image": "/images/products/climbing-ropes-carabiners/climbing-ropes-carabiners.jpg",
        "fallbackImage": "/images/equipment/Climbing Ropes & Carabiner.jpg",
        "altText": "CE Certified Climbing Ropes and Auto-Lock Carabiners supplied by Starline Adventures in India",
        "shortDesc": "Certified static and dynamic kernmantle ropes, auto-locking alloy carabiners, belay controllers, and connector hardware.",
        "fullDesc": "Professional height-safety connection and rigging kit combining low-stretch static and energy-absorbing dynamic kernmantle climbing ropes with hot-forged alloy steel and aluminium screw/auto-locking carabiners, figure-8 descenders, and assisted-braking belay controllers.",
        "specs": [
            {
                "label": "Rope Diameters",
                "value": "9.5mm, 10.5mm, 11mm, 12mm & 14mm CE/UIAA certified kernmantle ropes"
            },
            {
                "label": "Connector Types",
                "value": "Auto-lock (3-stage), twist-lock, screw-lock alloy carabiners & quick links"
            },
            {
                "label": "Breaking Strengths",
                "value": "Ropes rated 28 kN - 35 kN; Carabiners rated 25 kN - 50 kN major axis"
            },
            {
                "label": "Belay Hardware",
                "value": "Assisted-braking devices, Figure-8 descenders, tubular ATC belay plates"
            },
            {
                "label": "Certifications",
                "value": "CE EN 1891, EN 892, EN 362, EN 12275, UIAA certified"
            }
        ]
    },
    {
        "name": "Climbing Holds & Wall Panels",
        "slug": "climbing-holds-wall-panels",
        "url": "/product/climbing-holds-wall-panels.html",
        "category": "Adventure Equipment",
        "image": "/images/products/climbing-holds-wall-panels/climbing-holds-wall-panels.jpeg",
        "fallbackImage": "/images/equipment/Climbing Holds & Wall Panels.jpeg",
        "altText": "Modular Climbing Holds and FRP Wall Panels manufactured by Starline Adventures in India",
        "shortDesc": "Ergonomic textured polyurethane modular climbing holds, 3D FRP panels, and pre-drilled multiplex bouldering boards.",
        "fullDesc": "Modular climbing wall surface and route-setting systems for commercial indoor and outdoor climbing arenas. Features high-friction micro-textured polyurethane holds (jugs, slopers, crimps, pinches), heavy-duty 3D FRP realistic rock panels, multi-ply birch multiplex boards with dense M10 T-nut grids, and multi-directional top anchors.",
        "specs": [
            {
                "label": "Hold Types & Shapes",
                "value": "Jugs, Slopers, Pinches, Pockets, Crimps, Edges, Footholds & Macro Volumes"
            },
            {
                "label": "Panel Materials",
                "value": "3D Realistic FRP Rock Panels / 18mm-21mm Birch Multiplex Plywood with quartz friction finish"
            },
            {
                "label": "Grid Matrix",
                "value": "Standard 100mm x 100mm to 150mm x 150mm stainless steel M10 T-nut spacing"
            },
            {
                "label": "Fasteners & Anchors",
                "value": "Grade 8.8 / 304 stainless steel socket cap Allen bolts & dual-point top anchor stations"
            },
            {
                "label": "Safety Standards",
                "value": "Complies with EN 12572-1 (Wall Structures) & EN 12572-3 (Holds)"
            }
        ]
    },
    {
        "name": "Rope Course Platforms & Obstacles",
        "slug": "rope-course-platforms-obstacles",
        "url": "/product/rope-course-platforms-obstacles.html",
        "category": "Adventure Equipment",
        "image": "/images/products/rope-course-platforms-obstacles/rope-course-platforms-obstacles.jpeg",
        "fallbackImage": "/images/equipment/Rope Course Platforms & Obstacles.jpeg",
        "altText": "Rope Course Platforms and Challenge Obstacles manufactured by Starline Adventures in India",
        "shortDesc": "Modular aerial tree and pole staging platforms, Burma bridges, swinging logs, wobble boards, and crossing elements.",
        "fullDesc": "Pre-engineered modular challenge elements and aerial resting stations for multi-tier low and high rope courses. Includes hexagonal, octagonal, and square steel/hardwood tree and pole platforms with continuous safety guardrails, Burma bridges, swinging logs, zigzag balance beams, rolling barrels, and obstacle connectors.",
        "specs": [
            {
                "label": "Platform Geometries",
                "value": "Hexagonal, Octagonal, Square & Wrap-around pole/tree collar mounts with 1.1m guardrails"
            },
            {
                "label": "Obstacle Types",
                "value": "Burma Bridge, Commando Crossing, Swinging Planks, Wobble Logs, Zigzag Beams, Spider Webs"
            },
            {
                "label": "Decking & Wood",
                "value": "Anti-slip FRP grating / Kiln-dried seasoned treated hardwood with drainage gaps"
            },
            {
                "label": "Hardware Included",
                "value": "Galvanized shackles, drop-forged eye bolts, turnbuckles, and safety tethers"
            },
            {
                "label": "Safety Compliance",
                "value": "Engineered to EN 15567-1 and EN 15567-2 aerial adventure park standards"
            }
        ]
    },
    {
        "name": "Adventure Park Platforms",
        "slug": "adventure-park-platforms",
        "url": "/product/adventure-park-platforms.html",
        "category": "Adventure Equipment",
        "image": "/images/products/adventure-park-platforms/adventure-park-platforms.jpeg",
        "fallbackImage": "/images/equipment/Adventure Park Platforms.jpeg",
        "altText": "Structural Steel Adventure Park Platforms manufactured by Starline Adventures in India",
        "shortDesc": "Pre-engineered structural steel staging platforms, zipline takeoff hubs, and intermediate activity towers.",
        "fullDesc": "Heavy structural steel takeoff, landing, and intermediate staging platforms for adventure parks, zipline terminals, and multi-activity hubs. Built with hot-dip galvanized structural steel sections, anti-slip diamond decking, certified PPE multi-directional anchor points, and integrated safety balustrades with self-closing entry gates.",
        "specs": [
            {
                "label": "Structural Framework",
                "value": "IS 2062 Grade E250 / E350 Structural MS I-beams, SHS columns, and diagonal truss bracing"
            },
            {
                "label": "Deck Surface",
                "value": "Anti-slip chequered diamond steel plate / Heavy-duty FRP composite grating"
            },
            {
                "label": "Guardrails & Gates",
                "value": "1.2m continuous perimeter steel balustrade with mesh infill and self-closing gravity gates"
            },
            {
                "label": "Anchor Points",
                "value": "Certified multi-directional PPE safety anchor eyelets rated to 22 kN each"
            },
            {
                "label": "Load Rating",
                "value": "Designed for distributed live loads up to 500 kg/m² for simultaneous group staging"
            }
        ]
    },
    {
        "name": "Cargo Nets & Net Bridges",
        "slug": "cargo-nets-net-bridges",
        "url": "/product/cargo-nets-net-bridges.html",
        "category": "Adventure Equipment",
        "image": "/images/products/cargo-nets-net-bridges/cargo-nets-net-bridges.jpeg",
        "fallbackImage": "/images/equipment/Cargo Nets & Net Bridges.jpeg",
        "altText": "Commercial Cargo Nets and Cylindrical Net Bridges manufactured by Starline Adventures in India",
        "shortDesc": "Industrial-strength braided nylon cargo climbing nets, scrambling walls, and cylindrical enclosed net bridges.",
        "fullDesc": "Turnkey rope netting solutions for obstacle courses, adventure towers, commando crawls, and canopy walks. Includes heavy braided UV-stabilized nylon/polypropylene cargo nets with reinforced border ropes and steel eye thimbles, as well as enclosed cylindrical tunnel and V-trough net bridges suspended on heavy steel cables.",
        "specs": [
            {
                "label": "Cordage & Diameters",
                "value": "12mm to 18mm high-tenacity UV-stabilized braided nylon and polypropylene ropes"
            },
            {
                "label": "Mesh Apertures",
                "value": "150mm x 150mm to 250mm x 250mm square grid openings with knotted or spliced junctions"
            },
            {
                "label": "Bridge Styles",
                "value": "Full Cylindrical Tunnel Bridge, V-Profile Net Walkway, U-Channel Suspended Net Bridge"
            },
            {
                "label": "Main Cables",
                "value": "12mm - 16mm galvanized steel wire ropes inside bottom tread and top handrail channels"
            },
            {
                "label": "UV & Weather Rating",
                "value": "100% rot-proof, mildew resistant, and UV-stabilized for multi-year exterior durability"
            }
        ]
    },
    {
        "name": "Tyre & Balance Obstacles",
        "slug": "tyre-balance-obstacles",
        "url": "/product/tyre-balance-obstacles.html",
        "category": "Adventure Equipment",
        "image": "/images/products/tyre-balance-obstacles/tyre-balance-obstacles.jpeg",
        "fallbackImage": "/images/equipment/Tyre_Balance_Obstacles.jpeg",
        "altText": "Suspended Tyre and Balance Obstacles manufactured by Starline Adventures in India",
        "shortDesc": "Suspended swinging tyre steps, horizontal tyre crawl tunnels, and elevated anti-slip balance beams.",
        "fullDesc": "Challenging agility and balance elements designed for ninja courses, tactical fitness tracks, and low/high rope challenge arenas. Features reinforced industrial automobile tyres with drainage weep holes suspended by calibrated short-link chains and sleeved cables, paired with treated timber or steel balance beams coated with non-slip quartz grit.",
        "specs": [
            {
                "label": "Obstacle Configurations",
                "value": "Swinging Tyre Steps, Horizontal Tyre Crawl Tunnel, Tyre Climb Wall, Suspended Walkway"
            },
            {
                "label": "Suspension Rigging",
                "value": "8mm to 10mm calibrated galvanized short-link steel chain with protective nylon outer sleeves"
            },
            {
                "label": "Beam Dimensions",
                "value": "100mm to 200mm walking width; 3m to 6m span length with quartz friction coating"
            },
            {
                "label": "Mounting Hardware",
                "value": "Swivel hinge brackets, drop-forged eye bolts, nyloc safety nuts, and backing plates"
            },
            {
                "label": "Safety Factor",
                "value": "5:1 structural safety factor on all dynamic suspension connections"
            }
        ]
    },
    {
        "name": "Adventure Park Ladders & Bridges",
        "slug": "adventure-park-ladders-bridges",
        "url": "/product/adventure-park-ladders-bridges.html",
        "category": "Adventure Equipment",
        "image": "/images/products/adventure-park-ladders-bridges/adventure-park-ladders-bridges.jpeg",
        "fallbackImage": "/images/equipment/Adventure Park Ladders & Bridges.jpeg",
        "altText": "Adventure Park Ladders and Walkway Bridges manufactured by Starline Adventures in India",
        "shortDesc": "Horizontal overhead ladder rigs, monkey bars, flexible rope ladders, and modular suspension pedestrian bridges.",
        "fullDesc": "Comprehensive upper-body obstacle and pedestrian crossing systems for adventure parks and tactical fitness courses. Includes straight, inclined, and wave monkey bar rigs, multi-tier pull-up and parallel bars, flexible timber-rung climbing rope ladders, and long-span steel cable suspended pedestrian walkway bridges.",
        "specs": [
            {
                "label": "Rig Structures",
                "value": "Horizontal Monkey Bars, Wave Ladders, Parallel Dip Bars, Multi-Height Pull-Up Stations"
            },
            {
                "label": "Suspension Bridges",
                "value": "Modular pedestrian suspension bridge assemblies from 10m to 150m+ spans"
            },
            {
                "label": "Rope Ladders",
                "value": "14mm-16mm synthetic side ropes with 40mm seasoned hardwood / fluted aluminium rungs"
            },
            {
                "label": "Materials & Finish",
                "value": "Heavy-gauge galvanized steel tubes (32mm-48mm diameter) with textured exterior powder coating"
            },
            {
                "label": "Live Load Capacity",
                "value": "Bridges rated for 400-500 kg/m²; Fitness bars tested for dynamic user loads up to 250 kg"
            }
        ]
    },
    {
        "name": "Safety Helmets & Fall-Arrest Systems",
        "slug": "safety-helmets-fall-arrest-systems",
        "url": "/product/safety-helmets-fall-arrest-systems.html",
        "category": "Adventure Equipment",
        "image": "/images/products/safety-helmets-fall-arrest-systems/safety-helmets-fall-arrest-systems.jpeg",
        "fallbackImage": "/images/equipment/Safety Helmets & Fall-Arrest Systems.jpeg",
        "altText": "Commercial Safety Helmets and Fall-Arrest Retractable Lifelines supplied by Starline Adventures in India",
        "shortDesc": "Impact-resistant ABS adventure helmets, automatic self-retracting lifelines, energy-absorbing lanyards, and rescue kits.",
        "fullDesc": "Comprehensive personal protective equipment (PPE) and rapid emergency retrieval systems. Includes ventilated dial-fit ABS adventure helmets, dual-pawl self-retracting lifelines (SRLs), twin-leg Y-shaped dynamic rope energy-absorbing lanyards for 100% tie-off, and auto-controlled descent rescue haul kits with telescoping reach poles.",
        "specs": [
            {
                "label": "Helmets",
                "value": "High-impact ABS shell with EPS foam liner and universal dial-fit ratchet (48cm - 62cm)"
            },
            {
                "label": "Fall Arresters",
                "value": "Self-Retracting Lifelines (SRL / Inertia Reels) with galvanized steel wire cable (6m - 30m)"
            },
            {
                "label": "Lanyards",
                "value": "11mm dynamic kernmantle rope / 30mm heavy tubular webbing Y-lanyards with energy absorbers"
            },
            {
                "label": "Rescue Kit",
                "value": "Automatic controlled descent device (0.8-1.5 m/s), 4:1 mechanical haul kit, 50m-100m rescue line"
            },
            {
                "label": "Standards",
                "value": "CE EN 12492 (Helmets), EN 360 (Fall Arrest), EN 355 (Lanyards), EN 341 (Rescue Devices)"
            }
        ]
    },
    {
        "name": "Steel Cables, Anchors & Rigging Equipment",
        "slug": "steel-cables-anchors-rigging-equipment",
        "url": "/product/steel-cables-anchors-rigging-equipment.html",
        "category": "Adventure Equipment",
        "image": "/images/products/steel-cables-anchors-rigging-equipment/steel-cables-anchors-rigging-equipment.jpeg",
        "fallbackImage": "/images/equipment/Steel Cables, Anchors & Rigging Equipment.jpeg",
        "altText": "Galvanized Steel Wire Ropes, Turnbuckles, and Rigging Hardware supplied by Starline Adventures in India",
        "shortDesc": "High-tensile galvanized wire ropes, drop-forged turnbuckles, clamps, chemical anchor studs, and earth ground anchors.",
        "fullDesc": "Industrial-grade structural rigging, tensioning, and foundational anchoring systems for high-altitude adventure rides, towers, ziplines, and bridges. Features 6x19 / 6x36 IWRC steel core wire ropes, drop-forged open/closed turnbuckles, Tiger wire rope clamps, heavy steel thimbles, pure epoxy chemical injection anchor studs, and helical screw earth ground anchors.",
        "specs": [
            {
                "label": "Steel Cables",
                "value": "8mm to 24mm 1770/1960 N/mm² High-Tensile Hot-Dip Galvanized IWRC Steel Wire Ropes"
            },
            {
                "label": "Rigging Hardware",
                "value": "Drop-forged turnbuckles (Jaw & Eye / Jaw & Jaw), Tiger U-clamps, bow shackles, thimbles"
            },
            {
                "label": "Concrete Anchors",
                "value": "M12 to M30 pure epoxy chemical injection studs & heavy expansion wedge anchors (ETA Option 1)"
            },
            {
                "label": "Earth Anchors",
                "value": "Heavy-duty helical screw ground anchors & percussion duckbill anchors (1.5m - 4.5m depth)"
            },
            {
                "label": "Compliance",
                "value": "IS 2266 / ISO 2408 (Wire Ropes), ASTM A153 Galvanizing, US Fed Spec FF-T-791b (Turnbuckles)"
            }
        ]
    }
];

// Expose globally for both browser and Node.js environments
if (typeof window !== 'undefined') {
    window.products = products;
    window.STARLINE_PRODUCTS = products;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = products;
}

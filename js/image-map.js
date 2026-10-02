/**
 * STARLINE ADVENTURES - CENTRALIZED IMAGE & ACTIVITY MAPPING SYSTEM
 * Single source of truth for all product, activity, and project image resolutions.
 * Matches activities to verified authentic existing image assets.
 * When no image exists, cleanly handles empty/placeholder state without unrelated image fallbacks.
 */

(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        const exported = factory();
        root.StarlineImageMap = exported;
        if (typeof window !== 'undefined') {
            window.StarlineImageMap = exported;
            window.STARLINE_IMAGE_MAP = exported.productImageMap;
            window.getProductImage = exported.getProductImage;
            window.normalizeActivityKey = exported.normalizeKey;
            window.renderProductCardImage = exported.renderProductCardImage;
            window.renderProductDetailImage = exported.renderProductDetailImage;
            window.getEmptyPlaceholderHtml = exported.getEmptyPlaceholderHtml;
            window.getVerifiedGalleryData = exported.getVerifiedGalleryData;
        }
    }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function() {

    /**
     * Centralized master product & activity image map.
     * Maps canonical activity IDs to verified existing on-disk image assets.
     * Missing or non-existent items are intentionally mapped to null so no unrelated image is used.
     */
    const productImageMap = {
        // 1. Giant Swing
        "giant-swing": {
            image: "images/activities/giant-swing.jpeg",
            alt: "Giant Pendulum Swing High-Altitude Ride - Starline Adventures",
            title: "Giant Swing",
            category: "activities",
            categoryLabel: "Activities",
            desc: "Massive A-frame pendulum swing providing exhilarating free-fall release and wide weightless arcs."
        },

        // 2. Zip Line
        "zip-line": {
            image: "images/activities/zipline_square.jpeg",
            alt: "High-Speed Commercial Zip Line Installation - Starline Adventures",
            title: "Zip Line",
            category: "activities",
            categoryLabel: "Activities",
            desc: "A classic overhead zip line that carries riders across scenic spans, lakes, and nature terrain."
        },

        // 3. Zip Bike / Sky Cycle
        "zip-bike-sky-cycle": {
            image: "images/activities/sky_cycle_square.jpeg",
            alt: "Suspended High-Wire Zip Bike and Sky Cycle Ride - Starline Adventures",
            title: "Zip Bike / Sky Cycle",
            category: "activities",
            categoryLabel: "Activities",
            desc: "Participants pedal specially modified aerodynamic bicycles across elevated overhead cable lines."
        },

        // 4. Sky Roller
        "sky-roller": {
            image: "images/activities/sky_roller_square.jpeg",
            alt: "Dynamic Overhead Sky Roller Cylinder Barrel Attraction - Starline Adventures",
            title: "Sky Roller",
            category: "activities",
            categoryLabel: "Activities",
            desc: "A rolling wheel-cage that carries a rider along an elevated high-tension cable line."
        },

        // 5. Wall Climbing
        "wall-climbing": {
            image: "images/products/wall-climbing/wall-climbing.jpeg",
            alt: "Wall Climbing Adventure Activity",
            title: "Wall Climbing",
            category: "activities",
            categoryLabel: "Activities",
            desc: "A textured climbing panel with ergonomic modular holds and certified auto-belays."
        },

        // 6. Ninja Rope Courses
        "ninja-rope-courses": {
            image: "images/activities/rope_course_square.jpeg",
            alt: "Multi-Level Ninja Aerial Rope Obstacle Challenge Course - Starline Adventures",
            title: "Ninja Rope Courses",
            category: "activities",
            categoryLabel: "Activities",
            desc: "A modular, multi-tier aerial obstacle course featuring continuous safety belay lifelines."
        },

        // 7. Multi Activity Tower
        "multi-activity-tower": {
            image: "images/activities/tower_square.jpeg",
            alt: "Multi-Activity Adventure Tower Structural Hub - Starline Adventures",
            title: "Multi Activity Tower",
            category: "activities",
            categoryLabel: "Activities",
            desc: "Consolidates 4 to 8 popular adventure activities into a single compact structural footprint."
        },

        // 8. Glass Bridge
        "glass-bridge": {
            image: "images/activities/glass_square.jpg",
            alt: "High-Altitude Transparent Structural Glass Bridge Walkway - Starline Adventures",
            title: "Glass Bridge",
            category: "activities",
            categoryLabel: "Activities",
            desc: "Constructed with triple-layer toughened laminated safety glass and structural steel trusses."
        },

        // 9. Human Gyro
        "human-gyro": {
            image: "images/activities/gyro_square.jpeg",
            alt: "3-Axis 360-Degree Human Gyroscope Thrill Ride - Starline Adventures",
            title: "Human Gyro",
            category: "activities",
            categoryLabel: "Activities",
            desc: "Modeled after space simulation and aerospace pilot training systems, rotating riders freely across 3 axes."
        },

        // 10. 360 Degree Cycle
        "360-degree-cycle": {
            image: "images/activities/360_square.jpeg",
            alt: "Vertical 360-Degree Inverted Loop Cycling Stunt Ride - Starline Adventures",
            title: "360 Degree Cycle",
            category: "activities",
            categoryLabel: "Activities",
            desc: "Riders pedal a counterbalanced sports bicycle inside a vertical circular steel loop to execute full 360° inversions."
        },

        // 11. Rocket Ejection
        "rocket-ejection": {
            image: "images/activities/ejector_square.jpeg?v=2",
            alt: "High-Altitude Twin-Tower Rocket Ejection Reverse Bungee Ride - Starline Adventures",
            title: "Rocket Ejection",
            category: "activities",
            categoryLabel: "Activities",
            desc: "Flagship high-altitude thrill attraction using heavy-gauge tensioned bungee cords and winches to catapult riders skyward."
        },

        // 12. Cup Ride / Spinning Cup
        "cup-ride": {
            image: "images/activities/cup_square.jpg",
            alt: "Family Mechanical Spinning Cup Theme Park Attraction - Starline Adventures",
            title: "Cup Ride",
            category: "activities",
            categoryLabel: "Activities",
            desc: "Classic rotating family amusement ride with center steering wheel for controllable spin speed."
        },

        // 13. Turnkey Installation & Manufacturing (Site work)
        "turnkey-installation": {
            image: "images/general/working.webp",
            alt: "Starline Adventures In-House Engineering & On-Site Installation Team",
            title: "Turnkey Installation & Engineering",
            category: "installation",
            categoryLabel: "Installation",
            desc: "Turnkey engineering, structural fabrication, proof testing, and certified on-site rigging."
        },

        // 14. Net Climbing
        "net-climbing": {
            image: "images/products/net-climbing/net-climbing.jpeg",
            alt: "Net Climbing Adventure Activity",
            title: "Net Climbing",
            category: "activities",
            categoryLabel: "Activities",
            desc: "A tensioned heavy-duty rope cargo net for participants to climb up, across, or through."
        },

        // 15. Rifle Shooting
        "rifle-shooting": {
            image: "images/activities/rifle_shooting.jpeg",
            alt: "Precision Target Air Rifle Shooting Range - Starline Adventures",
            title: "Rifle Shooting",
            category: "activities",
            categoryLabel: "Activities",
            desc: "A dedicated target skill range for precision target shooting with calibre 0.177 air rifles and safety containment."
        },

        // 16. Bull Ride
        "bull-ride": {
            image: "images/activities/bull_ride.jpeg",
            alt: "Mechanical Rodeo Bull Ride Inflatable Arena - Starline Adventures",
            title: "Bull Ride",
            category: "activities",
            categoryLabel: "Activities",
            desc: "Mechanical rodeo bull ride with adjustable dual-axis spin speeds and a cushioned commercial inflatable ring."
        },

        // 17. Trampoline
        "trampoline": {
            image: "images/activities/trampoline.jpeg",
            alt: "Commercial Adventure Trampoline Setup - Starline Adventures",
            title: "Trampoline",
            category: "activities",
            categoryLabel: "Activities",
            desc: "Commercial high-rebound trampoline and bungee trampoline arena allowing jumpers to flip and bounce safely."
        },

        // 18. 4 in 1 Bungee Jumping (Trampoline)
        "4-in-1-bungee-jumping": {
            image: "images/activities/trampoline.jpeg",
            alt: "4 in 1 Bungee Jumping Trampoline Station - Starline Adventures",
            title: "4 in 1 Bungee Jumping",
            category: "activities",
            categoryLabel: "Activities",
            desc: "Four-station bungee trampolines that let a group bounce and flip together in total harness security."
        },

        // 19. Archery
        "archery": {
            image: "images/activities/archery.jpeg",
            alt: "Traditional Bow and Arrow Archery Range - Starline Adventures",
            title: "Archery",
            category: "activities",
            categoryLabel: "Activities",
            desc: "A traditional bow-and-arrow skill range with professional targets, recurve bows, and perimeter backdrop netting."
        },

      
       "suspension-bridge": {
            image: "images/activities/suspension_bridge.jpg",
            alt: "Suspension Bridge Adventure Activity",
            title: "Suspension Bridge",
            category: "activities",
            categoryLabel: "Activities",
            desc: "A thrilling bridge experience that tests balance, confidence and adventure."
},

        // 15 Main Equipment Categories (mapped to authentic images in images/equipment/ by their name):
        "open-gym-equipment": {
            image: "images/equipment/Open Gym Equipment.jpeg",
            alt: "Commercial Outdoor Open Gym Fitness Equipment - Starline Adventures",
            desc: "Heavy-gauge galvanized steel outdoor open gym fitness machines and exercise stations."
        },
        "climbing-wall-equipment": {
            image: "images/equipment/Climbing Wall Equipment.jpeg",
            alt: "Climbing Wall Equipment, Holds & Auto-Belay Units - Starline Adventures",
            desc: "CE / EN 12572 compliant climbing wall hardware, modular climbing holds, top anchors, and safety auto-belays."
        },
        "rope-course-equipment": {
            image: "images/equipment/Rope Course Equipment.webp",
            alt: "Rope Course Continuous Belay Equipment & Hardware - Starline Adventures",
            desc: "Certified continuous belay lifelines, trolleys, clamps, harnesses, and hardware for high & low rope obstacle courses."
        },
        "safety-nets": {
            image: "images/equipment/Safety Nets.jpeg",
            alt: "High-Tensile Safety Catch Nets - Starline Adventures",
            desc: "Heavy-duty UV-stabilized nylon and polypropylene safety fall-arrest and debris containment catch nets."
        },
        "safety-harness-belts": {
            image: "images/equipment/Safety Harness & Belts.jpg",
            alt: "Certified Commercial Safety Harnesses & Belts - Starline Adventures",
            desc: "Full-body and sit-in commercial adventure safety harnesses with forged alloy steel D-rings and rapid-adjust buckles."
        },
        "zipline-equipment": {
            image: "images/equipment/Zipline Equipment.webp",
            alt: "Commercial Zipline Rigging, Pulleys & Brakes - Starline Adventures",
            desc: "Precision dual-bearing tandem stainless steel zipline trolleys, impact brake spring buffers, cables, and certified lanyards."
        },
        "climbing-ropes-carabiners": {
            image: "images/equipment/Climbing Ropes & Carabiner.jpg",
            alt: "Climbing Ropes & Carabiners",
            desc: "High-quality climbing ropes, carabiners and connectors designed for adventure activities and rope course safety."
        },
           
         "climbing-holds-wall-panels": {
            image: "images/equipment/Climbing Holds & Wall Panels.jpeg",
            alt: "Climbing Holds & Wall Panels",
            desc: "Durable climbing holds and wall panels designed for climbing walls, training areas, and adventure parks."
        },
        "rope-course-platforms-obstacles": {
            image: "images/equipment/Rope Course Platforms & Obstacles.jpeg",
            alt: "Rope Course Platforms & Obstacles",
            desc: "Durable rope course platforms and obstacles designed for adventure parks, rope courses, and outdoor challenge activities."
        },
        "adventure-park-platforms": {
            image: "images/equipment/Adventure Park Platforms.jpeg",
            alt: "Adventure Park Structural Platforms & Towers - Starline Adventures",
            desc: "Pre-engineered structural steel staging platforms, zipline takeoff hubs, and intermediate activity towers."
        },
        "cargo-nets-net-bridges": {
            image: "images/equipment/Cargo Nets & Net Bridges.jpeg",
            alt: "Braided Cargo Scrambling Nets & Net Bridges - Starline Adventures",
            desc: "Industrial-strength braided nylon cargo climbing nets, commando crawls, and enclosed cylindrical suspended net bridges."
        },
        "tyre-balance-obstacles": {
             image: "images/products/tyre-wall/tyre-wall.jpeg",
             alt: "Tyre Wall Adventure Activity",
              desc: "Durable tyre balance obstacles designed for adventure parks, obstacle courses, and outdoor training areas."
        },
        "adventure-park-ladders-bridges": {
            image: "images/equipment/Adventure Park Ladders & Bridges.jpeg",
            alt: "Adventure Park Ladders & Bridges - Starline Adventures",
            desc: "Horizontal overhead ladder rigs, monkey bars, flexible rope ladders, and modular suspension pedestrian bridges."
        },
        "safety-helmets-fall-arrest-systems": {
            image: "images/equipment/Safety Helmets & Fall-Arrest Systems.jpeg",
            alt: "Adventure Safety Helmets & Fall-Arrest PPE - Starline Adventures",
            desc: "Impact-resistant dial-fit ABS helmets, self-retracting lifelines (SRLs), and dynamic energy-absorbing twin lanyards."
        },
        "steel-cables-anchors-rigging-equipment": {
            image: "images/equipment/Steel Cables, Anchors & Rigging Equipment.jpeg",
            alt: "Galvanized Steel Cables, Turnbuckles & Rigging - Starline Adventures",
            desc: "High-tensile IWRC galvanized steel wire ropes, drop-forged turnbuckles, tiger clamps, and chemical anchor studs."
        }
    };

    /**
     * Verified Project Client Logos Mapping
     */
    const projectLogoMap = {
        "the-grand-machal-resorts": "images/projects/grand_machal.jpg",
        "grand-machal": "images/projects/grand_machal.jpg",
        "ikya-island-mussoorie": "images/projects/ikya_island.jpg",
        "ikya-island": "images/projects/ikya_island.jpg",
        "forest-department": "images/projects/forest_department.svg",
        "pench-tiger-reserve": "images/projects/pench_logo.webp",
        "devgad-zipline": "images/projects/flying_kokan.jpeg",
        "devgad-adventure": "images/projects/flying_kokan.jpeg",
        "maniratna-resort": "images/projects/maniratna.jpeg",
        "srushti-farms": "images/projects/srushti_farm.png",
        "srushti-farm": "images/projects/srushti_farm.png"
    };

    /**
     * Normalizes names, activity titles, IDs, or filenames into a canonical lookup key.
     * E.g. "Zip Line", "zip-line", "zip_line", "Zipline", "zipline_square.jpeg" -> "zip-line"
     */
    function normalizeKey(input) {
        if (!input) return "";

        let key = String(input).trim().toLowerCase();

        // Strip file extensions if filename passed
        key = key.replace(/\.(jpeg|jpg|png|webp|svg)$/i, "");

        // Strip common filename suffixes and special characters
        key = key.replace(/^(images\/|activity_images\/|\/images\/|\/activity_images\/)/i, "");
        key = key.replace(/_(square|square1|work|new|2)$/i, "");
        key = key.replace(/\s+(square|square1|work|new|2)$/i, "");
        key = key.replace(/[^\w\s-]/g, " ");

        // Convert delimiters to hyphens
        key = key.replace(/[\s/_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

        // Equipment specific canonical checks (checked first so they are not captured by generic ride names)
        if (key.includes("open-gym")) {
            return "open-gym-equipment";
        }
        if (key.includes("climbing-wall-equipment")) {
            return "climbing-wall-equipment";
        }
        if (key.includes("rope-course-platforms") || key.includes("platforms-obstacles") || key.includes("course-obstacles")) {
            return "rope-course-platforms-obstacles";
        }
        if (key.includes("rope-course-equipment")) {
            return "rope-course-equipment";
        }
        if (key.includes("safety-nets") || key === "safety-net") {
            return "safety-nets";
        }
        if (key.includes("harness") || key.includes("belts")) {
            return "safety-harness-belts";
        }
        if (key.includes("zipline-equipment") || key.includes("zipline-safety")) {
            return "zipline-equipment";
        }
        if (key.includes("ropes-carabiners") || key.includes("climbing-ropes") || key.includes("carabiner")) {
            return "climbing-ropes-carabiners";
        }
        if (key.includes("holds-wall-panels") || key.includes("climbing-holds") || key.includes("wall-panels")) {
            return "climbing-holds-wall-panels";
        }
        if (key.includes("adventure-park-platforms") || key === "park-platforms") {
            return "adventure-park-platforms";
        }
        if (key.includes("cargo-nets") || key.includes("net-bridges")) {
            return "cargo-nets-net-bridges";
        }
        if (key.includes("tyre") || key.includes("balance-obstacles") || key.includes("balance-beams")) {
            return "tyre-balance-obstacles";
        }
        if (key.includes("ladders-bridges") || key.includes("monkey-bars") || key.includes("horizontal-ladders") || key.includes("suspension-bridges-equipment")) {
            return "adventure-park-ladders-bridges";
        }
        if (key.includes("helmets") || key.includes("fall-arrest") || key.includes("rescue-equipment")) {
            return "safety-helmets-fall-arrest-systems";
        }
        if (key.includes("steel-cables") || key.includes("rigging-equipment") || key.includes("anchoring-fixing") || key.includes("ground-anchors")) {
            return "steel-cables-anchors-rigging-equipment";
        }

        // Activity specific canonical alias mapping
        if (key === "zipline" || key === "zip-lines" || key === "ziplines" || key === "zip-line" || key === "zipline-square") {
            return "zip-line";
        }
        if (key.includes("sky-cycle") || key.includes("zip-bike") || key.includes("skycycle") || key === "sky-cycle-square") {
            return "zip-bike-sky-cycle";
        }
        if (key.includes("giant-swing") || key === "giant-swing-2" || key === "giant-swing-new" || key === "giant-swing") {
            return "giant-swing";
        }
        if (key.includes("wall-climbing") || key.includes("rock-climbing") || key === "wall-climbing-square") {
            return "wall-climbing";
        }
        if (key.includes("rope-course") || key.includes("ninja-rope") || key === "rope-course-square") {
            return "ninja-rope-courses";
        }
        if (key.includes("multi-activity-tower") || key.includes("multi-tower") || key === "tower-square" || key === "multi-tower") {
            return "multi-activity-tower";
        }
        if (key.includes("glass-bridge") || key.includes("glass-skywalk") || key === "glass-square") {
            return "glass-bridge";
        }
        if (key.includes("human-gyro") || key === "gyro" || key === "gyroscope" || key === "gyro-square") {
            return "human-gyro";
        }
        if (key.includes("360") && (key.includes("cycle") || key.includes("loop"))) {
            return "360-degree-cycle";
        }
        if (key.includes("rocket-ejection") || key.includes("ejector") || key === "ejector-square" || key === "ejector-square1") {
            return "rocket-ejection";
        }
        if (key.includes("sky-roller") || key === "sky-roller-square") {
            return "sky-roller";
        }
        if (key.includes("cup") || key === "cup-square" || key.includes("tea-cup")) {
            return "cup-ride";
        }
        if (key.includes("working") || key.includes("turnkey-installation") || key.includes("manufacturing")) {
            return "turnkey-installation";
        }
        if (key.includes("net-climbing") || key.includes("net_climbing") || key.includes("cargo-net-climb") || key === "net-climbing") {
            return "net-climbing";
        }
        if (key.includes("rifle") || key.includes("rifale") || key.includes("shooting")) {
            return "rifle-shooting";
        }
        if (key.includes("bull") || key.includes("rodeo")) {
            return "bull-ride";
        }
        if (key.includes("trampoline")) {
            return "trampoline";
        }
        if (key.includes("bungee-jumping") || key.includes("4-in-1")) {
            return "4-in-1-bungee-jumping";
        }
        if (key.includes("archery") || key.includes("bow")) {
            return "archery";
        }

        return key;
    }

    /**
     * Look up the authentic, verified image for any product or activity.
     * Returns the image path string (e.g. "images/activities/zipline_square.jpeg") or null if no valid image exists.
     */
    function getProductImage(productOrNameOrId) {
        if (!productOrNameOrId) return null;

        let canonicalKey = "";

        if (typeof productOrNameOrId === "object") {
            if (productOrNameOrId.image && typeof productOrNameOrId.image === "string" && productOrNameOrId.image.trim() !== "") {
                return productOrNameOrId.image;
            }
            if (productOrNameOrId.id) {
                canonicalKey = normalizeKey(productOrNameOrId.id);
            }
            if (!productImageMap[canonicalKey] && productOrNameOrId.name) {
                canonicalKey = normalizeKey(productOrNameOrId.name);
            }
        } else {
            canonicalKey = normalizeKey(productOrNameOrId);
        }

        const entry = productImageMap[canonicalKey];
        if (entry && entry.image) {
            return entry.image;
        }

        return null;
    }

    /**
     * Look up the full image metadata object for an activity.
     */
    function getProductImageEntry(productOrNameOrId) {
        if (!productOrNameOrId) return null;
        let canonicalKey = "";

        if (typeof productOrNameOrId === "object") {
            if (productOrNameOrId.id) canonicalKey = normalizeKey(productOrNameOrId.id);
            if (!productImageMap[canonicalKey] && productOrNameOrId.name) canonicalKey = normalizeKey(productOrNameOrId.name);
        } else {
            canonicalKey = normalizeKey(productOrNameOrId);
        }

        return productImageMap[canonicalKey] || null;
    }

    /**
     * Returns verified project logo path
     */
    function getProjectLogo(projectIdOrName) {
        if (!projectIdOrName) return null;
        const key = normalizeKey(projectIdOrName);
        return projectLogoMap[key] || null;
    }

    /**
     * Standardized HTML for clean empty / "Image coming soon" placeholder.
     * Never uses Starline logo or unrelated photos as a substitute.
     */
    function getEmptyPlaceholderHtml(name, isDetailView) {
        const cleanName = escapeHtml(name || "Adventure Equipment");
        if (isDetailView) {
            return `
                <div class="product-empty-image-placeholder">
                    <span class="product-empty-icon" aria-hidden="true">📷</span>
                    <div class="product-empty-text">${cleanName}</div>
                    <div class="product-empty-subtext">Product Image Coming Soon</div>
                </div>
            `;
        }
        return `
            <div class="product-card-empty-box">
                <span class="product-card-empty-icon" aria-hidden="true">📷</span>
                <span class="product-card-empty-text">Image coming soon</span>
            </div>
        `;
    }

    /**
     * Renders image or placeholder for product catalog cards.
     */
    function renderProductCardImage(product) {
        const imgUrl = getProductImage(product);
        const name = (product && product.name) ? product.name : "Product";

        if (imgUrl && imgUrl.trim() !== "") {
            return `
                <img src="${escapeHtml(imgUrl)}"
                     alt="${escapeHtml(name)} - Starline Adventures"
                     class="product-item-img"
                     loading="lazy"
                     decoding="async"
                     onerror="this.onerror=null; this.parentElement.innerHTML = getEmptyPlaceholderHtml('${escapeHtml(name)}', false);">
            `;
        }
        return getEmptyPlaceholderHtml(name, false);
    }

    /**
     * Renders image or placeholder for Product Details page.
     */
    function renderProductDetailImage(product) {
        const imgUrl = getProductImage(product);
        const name = (product && product.name) ? product.name : "Product";

        if (imgUrl && imgUrl.trim() !== "") {
            return `
                <img src="${escapeHtml(imgUrl)}"
                     alt="${escapeHtml(name)} - Starline Adventures"
                     loading="eager"
                     decoding="async"
                     onerror="this.onerror=null; this.parentElement.innerHTML = getEmptyPlaceholderHtml('${escapeHtml(name)}', true);">
            `;
        }
        return getEmptyPlaceholderHtml(name, true);
    }

    /**
     * Returns ONLY authentic, verified existing photos for the gallery.
     * Eliminates broken references and unverified images.
     */
    function getVerifiedGalleryData() {
        return [
            {
                id: "gallery-zip-line",
                filename: "zipline_square.jpeg",
                src: "images/activities/zipline_square.jpeg",
                title: "High-Speed Commercial Zip Line Installation",
                category: "activities",
                categoryLabel: "Activities",
                desc: "Long-span commercial wire rope zip line glide across adventure park terrain.",
                alt: "High speed commercial zip line flight - Starline Adventures"
            },
            {
                id: "gallery-giant-swing",
                filename: "Giant swing.jpeg",
                src: "images/activities/giant-swing.jpeg",
                title: "Giant Pendulum Swing Free-Fall Thrill",
                category: "activities",
                categoryLabel: "Activities",
                desc: "Twin riders soaring through high-altitude weightless pendulum arcs in safety harnesses.",
                alt: "Participants riding giant pendulum swing - Starline Adventures"
            },
            {
                id: "gallery-sky-cycle",
                filename: "sky_cycle_square.jpeg",
                src: "images/activities/sky_cycle_square.jpeg",
                title: "High-Wire Zip Bike & Aerial Sky Cycling",
                category: "activities",
                categoryLabel: "Activities",
                desc: "Participants pedaling custom aerodynamic sports cycles suspended on high-tension wire ropes.",
                alt: "Adventurers riding elevated sky cycle - Starline Adventures"
            },
            {
                id: "gallery-rope-course",
                filename: "rope_course_square.jpeg",
                src: "images/activities/rope_course_square.jpeg",
                title: "Multi-Tier Ninja Aerial Rope Obstacle Course",
                category: "activities",
                categoryLabel: "Activities",
                desc: "Continuous belay challenge obstacle course featuring suspended wooden beams and balance crossings.",
                alt: "Aerial high ropes obstacle challenge course - Starline Adventures"
            },
            {
                id: "gallery-wall-climbing",
                filename: "wall-climbing.jpeg",
                src: "images/products/wall-climbing/wall-climbing.jpeg",
                title: "Wall Climbing Adventure Activity",
                category: "activities",
                categoryLabel: "Activities",
                desc: "Outdoor textured climbing wall equipped with ergonomic holds and auto-belay fall arrest safety stations.",
                alt: "Wall Climbing Adventure Activity"
            },
            {
                id: "gallery-activity-tower",
                filename: "tower_square.jpeg",
                src: "images/activities/tower_square.jpeg",
                title: "Multi-Activity Adventure Tower Hub",
                category: "activities",
                categoryLabel: "Activities",
                desc: "Integrated structural adventure tower combining wall climbing, rappelling, and zip line takeoffs.",
                alt: "Multi activity adventure steel tower - Starline Adventures"
            },
            {
                id: "gallery-glass-bridge",
                filename: "glass_square.jpg",
                src: "images/activities/glass_square.jpg",
                title: "High-Altitude Engineered Glass Bridge Skywalk",
                category: "activities",
                categoryLabel: "Activities",
                desc: "Triple-layer toughened laminated transparent glass bridge walkway spanning open terrain.",
                alt: "Visitors on high altitude engineered glass bridge - Starline Adventures"
            },
            {
                id: "gallery-human-gyro",
                filename: "gyro_square.jpeg",
                src: "images/activities/gyro_square.jpeg",
                title: "3-Axis Space Simulation Human Gyroscope",
                category: "activities",
                categoryLabel: "Activities",
                desc: "360-degree rotational astronaut training gyro ride spinning riders across three concentric axes.",
                alt: "Human gyroscope 360 degree space ride - Starline Adventures"
            },
            {
                id: "gallery-360-cycle",
                filename: "360_square.jpeg",
                src: "images/activities/360_square.jpeg",
                title: "360° Vertical Loop Stunt Cycling Challenge",
                category: "activities",
                categoryLabel: "Activities",
                desc: "Rider pedaling through a full vertical loop inversion locked to circular structural steel rail.",
                alt: "Rider doing 360 degree vertical loop cycling stunt - Starline Adventures"
            },
            {
                id: "gallery-rocket-ejection",
                filename: "ejector_square.jpeg",
                src: "images/activities/ejector_square.jpeg?v=2",
                title: "Twin-Tower Rocket Ejection Reverse Bungee",
                category: "activities",
                categoryLabel: "Activities",
                desc: "High-altitude vertical catapult launching participants skyward with intense acceleration.",
                alt: "Rocket ejection reverse bungee ride launch - Starline Adventures"
            },
            {
                id: "gallery-sky-roller",
                filename: "sky_roller_square.jpeg",
                src: "images/activities/sky_roller_square.jpeg",
                title: "Sky Roller Elevated Cable Rolling Capsule",
                category: "activities",
                categoryLabel: "Activities",
                desc: "Rotating cylindrical passenger capsule gliding on high-tension steel overhead cables.",
                alt: "Sky roller rolling barrel cable ride - Starline Adventures"
            },
            {
                id: "gallery-cup-ride",
                filename: "cup_square.jpg",
                src: "images/activities/cup_square.jpg",
                title: "Mechanical Spinning Cup Theme Park Ride",
                category: "activities",
                categoryLabel: "Activities",
                desc: "Family mechanical rotating cups with center wheel control for interactive guest fun.",
                alt: "Spinning cup family amusement attraction - Starline Adventures"
            },
            {
                id: "gallery-turnkey-installation",
                filename: "working.webp",
                src: "images/general/working.webp",
                title: "In-House Structural Fabrication & Certified Installation",
                category: "installation",
                categoryLabel: "Installation",
                desc: "Starline engineering specialists assembling and proof testing precision steel adventure components.",
                alt: "Starline fabrication and installation engineering team at work - Starline Adventures"
            },
            {
                id: "gallery-net-climbing",
                filename: "net-climbing.jpeg",
                src: "images/products/net-climbing/net-climbing.jpeg",
                title: "Net Climbing Adventure Activity",
                category: "activities",
                categoryLabel: "Activities",
                desc: "High-strength cargo net climb developing agility, grip, and upper-body balance on adventure towers.",
                alt: "Net Climbing Adventure Activity"
            },
            {
                id: "gallery-rifle-shooting",
                filename: "Rifale_shooting.jpeg",
                src: "images/activities/rifle_shooting.jpeg",
                title: "Precision Air Rifle Target Shooting Range",
                category: "activities",
                categoryLabel: "Activities",
                desc: "Supervised precision target range with safety backdrops and individual shooting booths.",
                alt: "Target air rifle shooting skill range - Starline Adventures"
            },
            {
                id: "gallery-bull-ride",
                filename: "Bull_ride.jpeg",
                src: "images/activities/bull_ride.jpeg",
                title: "Mechanical Rodeo Bull Ride",
                category: "activities",
                categoryLabel: "Activities",
                desc: "Dual-axis motorized mechanical bull ride with operator speed controls in cushioned inflatable ring.",
                alt: "Mechanical rodeo bull ride in inflatable arena - Starline Adventures"
            },
            {
                id: "gallery-trampoline",
                filename: "trampoline.jpeg",
                src: "images/activities/trampoline.jpeg",
                title: "Commercial Bungee Trampoline Attraction",
                category: "activities",
                categoryLabel: "Activities",
                desc: "High-bounce bungee trampoline station allowing riders to soar and perform safe aerial flips.",
                alt: "Participant bouncing on bungee trampoline - Starline Adventures"
            },
            {
                id: "gallery-archery",
                filename: "Archery.jpeg",
                src: "images/activities/archery.jpeg",
                title: "Traditional Archery Target Sports Range",
                category: "activities",
                categoryLabel: "Activities",
                desc: "Target archery range with high-density straw bosses, recurve bows, and protective backstop netting.",
                alt: "Archery bow and arrow target sports range - Starline Adventures"
            },
            {
                id: "gallery-adventure-platforms",
                filename: "Adventure Park Platforms.jpeg",
                src: "images/equipment/Adventure Park Platforms.jpeg",
                title: "Adventure Park Platforms & Takeoff Hubs",
                category: "installation",
                categoryLabel: "Installation",
                desc: "Heavy structural steel staging platforms, zipline takeoff hubs, and intermediate activity towers.",
                alt: "Adventure park takeoff platform fabrication and installation - Starline Adventures"
            },
            {
                id: "gallery-ladders-bridges",
                filename: "Adventure Park Ladders & Bridges.jpeg",
                src: "images/equipment/Adventure Park Ladders & Bridges.jpeg",
                title: "Adventure Park Ladders & Bridges",
                category: "installation",
                categoryLabel: "Installation",
                desc: "Horizontal overhead ladder rigs, monkey bars, flexible rope ladders, and modular suspension pedestrian bridges.",
                alt: "Adventure park ladders and suspension bridges - Starline Adventures"
            },
            {
                id: "gallery-rope-course-equipment",
                filename: "Rope Course Equipment.webp",
                src: "images/equipment/Rope Course Equipment.webp",
                title: "Rope Course Continuous Belay Equipment",
                category: "installation",
                categoryLabel: "Installation",
                desc: "Certified continuous belay lifelines, trolleys, clamps, harnesses, and hardware for high & low rope obstacle courses.",
                alt: "Rope course continuous belay equipment and rigging hardware - Starline Adventures"
            },
            {
                id: "gallery-rope-course-platforms",
                filename: "Rope Course Platforms & Obstacles.jpeg",
                src: "images/equipment/Rope Course Platforms & Obstacles.jpeg",
                title: "Rope Course Platforms & Obstacles",
                category: "installation",
                categoryLabel: "Installation",
                desc: "Modular aerial staging platforms, Burma bridges, swinging logs, and high/low rope challenge course obstacles.",
                alt: "Modular rope course challenge platforms and obstacle crossings - Starline Adventures"
            },
            {
                id: "gallery-cargo-nets-bridges",
                filename: "Cargo Nets & Net Bridges.jpeg",
                src: "images/equipment/Cargo Nets & Net Bridges.jpeg",
                title: "Cargo Nets & Suspended Net Bridges",
                category: "installation",
                categoryLabel: "Installation",
                desc: "Industrial-strength braided nylon cargo climbing nets, commando crawls, and enclosed cylindrical suspended net bridges.",
                alt: "Braided cargo nets and net bridges installation - Starline Adventures"
            },
            {
                id: "gallery-rigging-equipment",
                filename: "Steel Cables, Anchors & Rigging Equipment.jpeg",
                src: "images/equipment/Steel Cables, Anchors & Rigging Equipment.jpeg",
                title: "Steel Cables, Anchors & Rigging Equipment",
                category: "installation",
                categoryLabel: "Installation",
                desc: "High-tensile IWRC galvanized steel wire ropes, drop-forged turnbuckles, tiger clamps, and chemical anchor studs.",
                alt: "High tensile steel cables turnbuckles and rigging equipment - Starline Adventures"
            }
        ];
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    return {
        productImageMap,
        projectLogoMap,
        normalizeKey,
        getProductImage,
        getProductImageEntry,
        getProjectLogo,
        getEmptyPlaceholderHtml,
        renderProductCardImage,
        renderProductDetailImage,
        getVerifiedGalleryData,
        escapeHtml
    };
});

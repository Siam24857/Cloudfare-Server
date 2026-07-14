import "dotenv/config";
import mongoose from "mongoose";
import Campaign from "./models/Campaign.js";
import User from "./models/User.js";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://Cluaeedfare:Cluaeedfare1597@cluster0.6ezfogq.mongodb.net/clodfare?appName=Cluster0";

const futureDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const creators = [
  { name: "Alex Carter", email: "creator@clodfare.com" },
  { name: "Maya Rivera", email: "maya.r@clodfare.com" },
  { name: "James Okafor", email: "james.o@clodfare.com" },
  { name: "Linh Tran", email: "linh.t@clodfare.com" },
  { name: "Samira Hassan", email: "samira.h@clodfare.com" },
];

const categories = [
  "Technology", "Art", "Education", "Environment", "Film", "Health",
  "Community", "Music", "Food", "Fashion",
];

const unsplash = (id) => `https://images.unsplash.com/${id}?w=800`;

const campaigns = [
  {
    campaign_title: "Solar-Powered Water Purifier",
    campaign_story: "Bringing clean drinking water to remote villages using affordable solar-powered purification units. Every contribution helps us build and ship more units to communities in need.",
    category: "Technology",
    funding_goal: 50000,
    minimum_contribution: 100,
    deadline: futureDate(45),
    reward_info: "Backers get a thank-you card and project updates.",
    campaign_image_url: unsplash("photo-1509391366360-2e959784a276"),
    amount_raised: 12500,
  },
  {
    campaign_title: "Handcrafted Wooden Toys Studio",
    campaign_story: "We craft eco-friendly wooden toys for children. Help us open a small workshop and hire local artisans to keep traditional craftsmanship alive.",
    category: "Art",
    funding_goal: 20000,
    minimum_contribution: 50,
    deadline: futureDate(30),
    reward_info: "A handcrafted wooden toy for backers over 500 credits.",
    campaign_image_url: unsplash("photo-1558877385-8c1b8d6a1a3d"),
    amount_raised: 8200,
  },
  {
    campaign_title: "Community Coding Bootcamp",
    campaign_story: "A free coding bootcamp for underprivileged youth. Funds go toward laptops, instructors, and a physical learning space for the next generation of developers.",
    category: "Education",
    funding_goal: 35000,
    minimum_contribution: 80,
    deadline: futureDate(60),
    reward_info: "Sponsor a student and receive their progress reports.",
    campaign_image_url: unsplash("photo-1522071820081-009f0129c71c"),
    amount_raised: 21000,
  },
  {
    campaign_title: "Urban Rooftop Garden Network",
    campaign_story: "Transforming unused city rooftops into green community gardens that grow fresh produce and reduce urban heat. Join us in greening the concrete jungle.",
    category: "Environment",
    funding_goal: 40000,
    minimum_contribution: 60,
    deadline: futureDate(50),
    reward_info: "Fresh produce box for local backers.",
    campaign_image_url: unsplash("photo-1416879595882-3373a0480b5b"),
    amount_raised: 15750,
  },
  {
    campaign_title: "Indie Documentary: Ocean Voices",
    campaign_story: "A feature documentary spotlighting coastal communities fighting to protect their oceans. Your support funds filming, editing, and festival submissions.",
    category: "Film",
    funding_goal: 60000,
    minimum_contribution: 120,
    deadline: futureDate(40),
    reward_info: "Digital screening access and credits mention.",
    campaign_image_url: unsplash("photo-1507525428034-b723cf961d3e"),
    amount_raised: 33400,
  },
  {
    campaign_title: "Mobile Health Clinic for Rural Areas",
    campaign_story: "A fully equipped van delivering basic healthcare, checkups, and vaccinations to rural areas that lack medical facilities. Help us save lives on wheels.",
    category: "Health",
    funding_goal: 75000,
    minimum_contribution: 150,
    deadline: futureDate(70),
    reward_info: "Regular impact reports and a name on the clinic wall.",
    campaign_image_url: unsplash("photo-1576091160399-112ba8d25d1d"),
    amount_raised: 41200,
  },
  {
    campaign_title: "AI Tutor for Rural Classrooms",
    campaign_story: "Deploying AI-powered tutoring tools in under-resourced schools to personalize learning and bridge the education gap for thousands of students.",
    category: "Technology",
    funding_goal: 55000,
    minimum_contribution: 90,
    deadline: futureDate(55),
    reward_info: "Early access to the platform and a thank-you from students.",
    campaign_image_url: unsplash("photo-1509062522246-3755977927d7"),
    amount_raised: 28900,
  },
  {
    campaign_title: "Mural Festival 2026",
    campaign_story: "Bringing 20 international street artists to transform our city's blank walls into vibrant murals. A week-long festival with workshops, music, and live painting.",
    category: "Art",
    funding_goal: 30000,
    minimum_contribution: 40,
    deadline: futureDate(35),
    reward_info: "Your name on our wall of supporters and a festival T-shirt.",
    campaign_image_url: unsplash("photo-1577083552431-6e5fd01988ec"),
    amount_raised: 18400,
  },
  {
    campaign_title: "Scholarships for First-Gen Students",
    campaign_story: "Providing full-tuition scholarships to first-generation college students from low-income families. Every dollar goes directly to tuition and books.",
    category: "Education",
    funding_goal: 100000,
    minimum_contribution: 200,
    deadline: futureDate(90),
    reward_info: "Quarterly updates from your sponsored scholar.",
    campaign_image_url: unsplash("photo-1523050854058-8df90110c7f1"),
    amount_raised: 52300,
  },
  {
    campaign_title: "Reforestation Drone Fleet",
    campaign_story: "Using custom drones to plant native tree seeds in deforested areas at 10x the speed of manual planting. Help us restore forests and fight climate change.",
    category: "Environment",
    funding_goal: 80000,
    minimum_contribution: 130,
    deadline: futureDate(80),
    reward_info: "Adopt a tree and track its growth via satellite.",
    campaign_image_url: unsplash("photo-1542601906990-b4d3fb778b09"),
    amount_raised: 46100,
  },
  {
    campaign_title: "Short Film: The Last Letter",
    campaign_story: "A poignant short film about a grandmother's final letter to her granddaughter, exploring memory, migration, and identity. Bound for the festival circuit.",
    category: "Film",
    funding_goal: 25000,
    minimum_contribution: 70,
    deadline: futureDate(25),
    reward_info: "Private screening link and credits mention.",
    campaign_image_url: unsplash("photo-1489599849927-2ee91cede3ba"),
    amount_raised: 16300,
  },
  {
    campaign_title: "Mental Health Support Hotline",
    campaign_story: "Funding a 24/7 helpline staffed by trained counsellors for young people struggling with anxiety, depression, and loneliness. Your support saves lives.",
    category: "Health",
    funding_goal: 45000,
    minimum_contribution: 80,
    deadline: futureDate(65),
    reward_info: "A Counsellor Thanks card and impact stats.",
    campaign_image_url: unsplash("photo-1571019613454-1cb2f99b2d8b"),
    amount_raised: 30100,
  },
  {
    campaign_title: "Neighbourhood Tool Library",
    campaign_story: "A community lending library for tools — from drills to lawnmowers. Reduce waste, save money, and help neighbours help each other.",
    category: "Community",
    funding_goal: 15000,
    minimum_contribution: 30,
    deadline: futureDate(20),
    reward_info: "Free annual membership and a tote bag.",
    campaign_image_url: unsplash("photo-1581092160562-40aa08e78837"),
    amount_raised: 9200,
  },
  {
    campaign_title: "Album: Sounds of the Savannah",
    campaign_story: "Recording a fusion album blending traditional African instruments with modern electronic production. Celebrating heritage through sound.",
    category: "Music",
    funding_goal: 22000,
    minimum_contribution: 50,
    deadline: futureDate(40),
    reward_info: "Digital download and name in liner notes.",
    campaign_image_url: unsplash("photo-1511671782779-c97d3d27a1d4"),
    amount_raised: 14100,
  },
  {
    campaign_title: "Farm-to-Table Community Kitchen",
    campaign_story: "Opening a community kitchen that sources from local farms, provides affordable meals, and teaches cooking classes to families in need.",
    category: "Food",
    funding_goal: 35000,
    minimum_contribution: 60,
    deadline: futureDate(50),
    reward_info: "Invite to the grand opening dinner.",
    campaign_image_url: unsplash("photo-1556911220-e15b29be8c8f"),
    amount_raised: 19700,
  },
  {
    campaign_title: "Adaptive Clothing Line for Disability",
    campaign_story: "Designing stylish, functional clothing for people with disabilities. Magnetic closures, adjustable fits, and sensory-friendly fabrics for all.",
    category: "Fashion",
    funding_goal: 28000,
    minimum_contribution: 70,
    deadline: futureDate(45),
    reward_info: "A piece from the debut collection.",
    campaign_image_url: unsplash("photo-1556306535-0f09a537f0a3"),
    amount_raised: 15200,
  },
  {
    campaign_title: "Open-Source IoT Weather Stations",
    campaign_story: "Building affordable, open-source weather stations for schools and farms. Real-time data on temperature, humidity, and rainfall for better decision-making.",
    category: "Technology",
    funding_goal: 32000,
    minimum_contribution: 60,
    deadline: futureDate(55),
    reward_info: "Build your own weather station kit.",
    campaign_image_url: unsplash("photo-1558618666-fcd25c85f82e"),
    amount_raised: 21300,
  },
  {
    campaign_title: "Pottery Studio for Women Artisans",
    campaign_story: "Establishing a pottery studio where women artisans can create, exhibit, and sell their work. Preserving traditional pottery techniques while building livelihoods.",
    category: "Art",
    funding_goal: 18000,
    minimum_contribution: 40,
    deadline: futureDate(30),
    reward_info: "A hand-thrown pottery piece from the studio.",
    campaign_image_url: unsplash("photo-1565128935710-53a106b3db58"),
    amount_raised: 10500,
  },
  {
    campaign_title: "STEM Lab for Girls",
    campaign_story: "Setting up a fully equipped STEM lab in a girls' school to encourage young women to pursue careers in science, technology, engineering, and mathematics.",
    category: "Education",
    funding_goal: 48000,
    minimum_contribution: 100,
    deadline: futureDate(60),
    reward_info: "Name a microscope or lab station after you.",
    campaign_image_url: unsplash("photo-1532094349884-543bc11b234d"),
    amount_raised: 28700,
  },
  {
    campaign_title: "Plastic-Free Grocery Store",
    campaign_story: "Launching a zero-waste grocery store with bulk bins, reusable containers, and locally sourced products. No plastic, no packaging waste.",
    category: "Environment",
    funding_goal: 55000,
    minimum_contribution: 100,
    deadline: futureDate(70),
    reward_info: "Lifetime 5% discount card and a starter kit.",
    campaign_image_url: unsplash("photo-1542838132-92c53300491e"),
    amount_raised: 33900,
  },
  {
    campaign_title: "Web Series: Diaspora Diaries",
    campaign_story: "A documentary web series following the lives of immigrants building new lives abroad while staying connected to their roots. Raw, real, and relatable.",
    category: "Film",
    funding_goal: 20000,
    minimum_contribution: 50,
    deadline: futureDate(35),
    reward_info: "Early access to all episodes and Q&A invite.",
    campaign_image_url: unsplash("photo-1478720568477-152d9b164e26"),
    amount_raised: 12100,
  },
  {
    campaign_title: "Community Fitness Park",
    campaign_story: "Building an open-air fitness park with calisthenics equipment, running track, and yoga deck in a public park. Free for everyone, forever.",
    category: "Health",
    funding_goal: 38000,
    minimum_contribution: 60,
    deadline: futureDate(50),
    reward_info: "Engraved brick at the fitness park entrance.",
    campaign_image_url: unsplash("photo-1571019613454-1cb2f99b2d8b"),
    amount_raised: 22400,
  },
  {
    campaign_title: "Community Radio Station",
    campaign_story: "Launching a non-profit community radio station broadcasting local news, music, and cultural programmes in three languages. Giving a voice to the unheard.",
    category: "Community",
    funding_goal: 25000,
    minimum_contribution: 50,
    deadline: futureDate(40),
    reward_info: "Dedicated shout-out on air and a sticker pack.",
    campaign_image_url: unsplash("photo-1590602847861-f357a9332bbc"),
    amount_raised: 16800,
  },
  {
    campaign_title: "Children's Music Album & Book",
    campaign_story: "Creating a bilingual children's album and companion picture book celebrating diverse cultures through catchy songs and vibrant illustrations.",
    category: "Music",
    funding_goal: 16000,
    minimum_contribution: 30,
    deadline: futureDate(25),
    reward_info: "Signed book-and-CD bundle.",
    campaign_image_url: unsplash("photo-1514320291840-2e0a9bf2a9ae"),
    amount_raised: 10400,
  },
  {
    campaign_title: "Mobile Food Truck: Global Flavours",
    campaign_story: "Taking global street food on the road — from Korean tacos to Ethiopian injera wraps. A mobile kitchen that brings the world's flavours to your neighbourhood.",
    category: "Food",
    funding_goal: 42000,
    minimum_contribution: 80,
    deadline: futureDate(45),
    reward_info: "Free meal voucher and naming on the truck.",
    campaign_image_url: unsplash("photo-1565128935710-53a106b3db58"),
    amount_raised: 27100,
  },
  {
    campaign_title: "Sustainable Swimwear Collection",
    campaign_story: "A swimwear line made entirely from recycled ocean plastics. Ethically produced, beautifully designed, and kind to the planet.",
    category: "Fashion",
    funding_goal: 24000,
    minimum_contribution: 60,
    deadline: futureDate(35),
    reward_info: "A piece from the collection and a beach tote.",
    campaign_image_url: unsplash("photo-1556306535-0f09a537f0a3"),
    amount_raised: 14300,
  },
  {
    campaign_title: "Smart Composting Bin",
    campaign_story: "An IoT-enabled composting bin that turns kitchen waste into rich fertiliser in 24 hours. Perfect for urban homes and community gardens.",
    category: "Technology",
    funding_goal: 60000,
    minimum_contribution: 110,
    deadline: futureDate(65),
    reward_info: "Early-bird unit at 30% off retail.",
    campaign_image_url: unsplash("photo-1542601906990-b4d3fb778b09"),
    amount_raised: 38700,
  },
  {
    campaign_title: "Theatre Production: Silk Road",
    campaign_story: "A contemporary dance and theatre piece tracing the ancient Silk Road's cultural exchange. Featuring an international cast of 15 performers.",
    category: "Art",
    funding_goal: 36000,
    minimum_contribution: 80,
    deadline: futureDate(50),
    reward_info: "Two premiere tickets and a programme credit.",
    campaign_image_url: unsplash("photo-1577083552431-6e5fd01988ec"),
    amount_raised: 23100,
  },
  {
    campaign_title: "Youth Leadership Summit 2026",
    campaign_story: "A week-long leadership summit for 100 young leaders from underserved communities. Workshops on entrepreneurship, advocacy, and civic engagement.",
    category: "Education",
    funding_goal: 52000,
    minimum_contribution: 110,
    deadline: futureDate(75),
    reward_info: "Sponsor a youth delegate and get a video thank-you.",
    campaign_image_url: unsplash("photo-1523050854058-8df90110c7f1"),
    amount_raised: 31200,
  },
  {
    campaign_title: "Ocean Cleanup: Mangrove Restoration",
    campaign_story: "Planting 100,000 mangroves along degraded coastlines to restore ecosystems, protect against storm surges, and sequester carbon. Join the blue-green revolution.",
    category: "Environment",
    funding_goal: 70000,
    minimum_contribution: 120,
    deadline: futureDate(85),
    reward_info: "Certificate of mangrove sponsorship with GPS data.",
    campaign_image_url: unsplash("photo-1507525428034-b723cf961d3e"),
    amount_raised: 45300,
  },
];

const run = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const creatorDocs = [];
  for (const c of creators) {
    let user = await User.findOne({ email: c.email });
    if (!user) {
      user = await User.create({
        name: c.name,
        email: c.email,
        password: "$2a$10$abcdefghijklmnopqrstuvSeedPlaceholderHashValue123456",
        role: "Creator",
        credits: 20,
        photoURL: "",
      });
      console.log("Created seed creator user:", c.email);
    }
    creatorDocs.push(user);
  }

  const docs = campaigns.map((c, i) => {
    const creator = creatorDocs[i % creatorDocs.length];
    return {
      ...c,
      creator_email: creator.email,
      creator_name: creator.name,
      status: "approved",
      suspended: false,
    };
  });

  await Campaign.deleteMany({});
  const inserted = await Campaign.insertMany(docs);
  console.log(`Inserted ${inserted.length} approved campaigns.`);

  await mongoose.disconnect();
  console.log("Done.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

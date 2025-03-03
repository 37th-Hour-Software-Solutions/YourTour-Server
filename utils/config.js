const BADGES = [
  {
    name: 'Tourist I',
    description: 'Visit 10 unique cities',
    static_image_url: 'bronze_tourist_badge.png'
  },
  {
    name: 'Tourist II',
    description: 'Visit 20 unique cities',
    static_image_url: 'silver_tourist_badge.png'
  },
  {
    name: 'Tourist III',
    description: 'Visit 50 unique cities',
    static_image_url: 'gold_tourist_badge.png'
  },
  {
    name: 'Tourist IV',
    description: 'Visit 100 unique cities',
    static_image_url: 'diamond_tourist_badge.png'
  },
  {
    name: 'Tourist V',
    description: 'Visit 500 unique cities',
    static_image_url: 'emerald_tourist_badge.png'
  },
  {
    name: 'Gem Hunter I',
    description: 'Find 1 gem',
    static_image_url: 'bronze_gem_badge.png'
  },
  {
    name: 'Gem Hunter II',
    description: 'Find 5 gems',
    static_image_url: 'silver_gem_badge.png'
  },
  {
    name: 'Gem Hunter III',
    description: 'Find 20 gems',
    static_image_url: 'gold_gem_badge.png'
  },
  {
    name: 'Gem Hunter IV',
    description: 'Find 50 gems',
    static_image_url: 'diamond_gem_badge.png'
  },
  {
    name: 'Gem Hunter V',
    description: 'Find 100 gems',
    static_image_url: 'emerald_gem_badge.png'
  },
  {
    name: 'In The Wild',
    description: 'Visit a city that has no facts',
    static_image_url: 'wild_badge.png'
  },
  {
    name: 'Explorer I',
    description: 'Visit 3 unique states',
    static_image_url: 'bronze_explorer_badge.png'
  },
  {
    name: 'Explorer II',
    description: 'Visit 5 unique states',
    static_image_url: 'silver_explorer_badge.png'
  },
  {
    name: 'Explorer III',
    description: 'Visit 10 unique states',
    static_image_url: 'gold_explorer_badge.png'
  },
  {
    name: 'Explorer IV',
    description: 'Visit 20 unique states',
    static_image_url: 'diamond_explorer_badge.png'
  },
  {
    name: 'Explorer V',
    description: 'Visit 50 unique states',
    static_image_url: 'emerald_explorer_badge.png'
  }
]

const INTERESTS = [
  {
    name: 'history',
  },
  {
    name: 'geography',
  },
  {
    name: 'culture',
  },
  {
    name: 'food',
  },
  {
    name: 'sports',
  },
  {
    name: 'kayaking',
  },
  {
    name: 'fishing',
  },
  {
    name: 'movies',
  },
  {
    name: 'tech',
  },
  {
    name: 'music',
  },
  {
    name: 'solo travel',
  },
  {
    name: 'animals',
  },
  {
    name: 'cross country',
  },
  {
    name: 'live events',
  },
  {
    name: 'hiking',
  },
  {
    name: 'working out',
  },
  {
    name: 'community culture',
  }
];

const GEMS = [
  {
    city: "Liberty",
    state: "Tennessee",
    description: "One of the founder's hometowns!",
  },
  {
    city: "Manchester",
    state: "Tennessee",
    description: "One of the founder's hometowns!",
  },
  {
    city: "White House",
    state: "Tennessee",
    description: "One of the founder's hometowns!",
  },
  {
    city: "Bell Buckle",
    state: "Tennessee",
    description: "One of the founder's hometowns!",
  },
  {
    city: "Farragut",
    state: "Tennessee",
    description: "One of the founder's hometowns!",
  },
  {
    city: "Lafayette",
    state: "Tennessee",
    description: "One of the founder's hometowns!",
  },
  {
    city: "New Hope",
    state: "Pennsylvania",
    description:
      "An artistic riverside town known for its galleries, theaters, and LGBTQ+ friendly atmosphere",
  },
  {
    city: "Mackinac Island",
    state: "Michigan",
    description:
      "A car-free island famous for its Victorian architecture, fudge shops, and horse-drawn carriages",
  },
  {
    city: "Marfa",
    state: "Texas",
    description:
      "Famous for its minimalist art installations, mysterious lights phenomenon, and quirky desert culture",
  },
  {
    city: "Eureka Springs",
    state: "Arkansas",
    description:
      "Victorian resort town built into the Ozark Mountains, known for its healing springs and unique architecture",
  },
  {
    city: "Harper's Ferry",
    state: "West Virginia",
    description:
      "Historic town at the confluence of two rivers, site of John Brown's raid and excellent hiking",
  },
  {
    city: "Dahlonega",
    state: "Georgia",
    description:
      "Site of the first major U.S. gold rush, featuring wineries and charming mountain town atmosphere",
  },
  {
    city: "Wallace",
    state: "Idaho",
    description:
      "Historic silver mining town where every downtown building is on the National Register of Historic Places",
  },
  {
    city: "Jacksonville",
    state: "Oregon",
    description:
      "Preserved Gold Rush town with beautiful Victorian architecture and award-winning wineries",
  },
  {
    city: "Leavenworth",
    state: "Washington",
    description:
      "Bavarian-themed town in the Cascade Mountains known for its festivals and outdoor recreation",
  },
  {
    city: "Mystic",
    state: "Connecticut",
    description:
      "Historic seaport with famous aquarium, maritime museums, and historic ships",
  },
  {
    city: "Yellow Springs",
    state: "Ohio",
    description:
      "Artistic community home to Antioch College, known for its progressive culture and nature preserves",
  },
  {
    city: "Stowe",
    state: "Vermont",
    description:
      "Picturesque ski town with von Trapp family history and world-class outdoor activities",
  },
  {
    city: "Apalachicola",
    state: "Florida",
    description:
      "Historic oyster town known for its seafood, antique shops, and Old Florida charm",
  },
  {
    city: "Galena",
    state: "Illinois",
    description:
      "Preserved 19th-century town with historic homes, including Ulysses S. Grant's residence",
  },
  {
    city: "Telluride",
    state: "Colorado",
    description:
      "Former mining camp turned festival town, surrounded by dramatic mountain peaks",
  },
  {
    city: "Deadwood",
    state: "South Dakota",
    description:
      "Preserved Wild West town where Wild Bill Hickok met his end, featuring historic reenactments",
  },
  {
    city: "Taos",
    state: "New Mexico",
    description:
      "Ancient pueblo community known for its art scene, adobe architecture, and Native American history",
  },
  {
    city: "Port Townsend",
    state: "Washington",
    description:
      "Victorian seaport known for wooden boat building, arts festivals, and maritime heritage",
  },
  {
    city: "Natchez",
    state: "Mississippi",
    description:
      "Antebellum city with the most pre-war mansions in the U.S., famous for its spring pilgrimage",
  },
  {
    city: "Jim Thorpe",
    state: "Pennsylvania",
    description:
      'Known as the "Switzerland of America" for its mountain setting and Victorian architecture',
  },
  {
    city: "Bisbee",
    state: "Arizona",
    description:
      "Artistic former copper mining town built into the hills with colorful architecture",
  },
  {
    city: "Woodstock",
    state: "Vermont",
    description:
      "Picture-perfect New England town with covered bridges and year-round outdoor activities",
  },
  {
    city: "Mendocino",
    state: "California",
    description:
      "Artistic coastal town with Victorian architecture, used as filming location for many movies",
  },
  {
    city: "Lindsborg",
    state: "Kansas",
    description:
      'Known as "Little Sweden USA" for its Swedish heritage, festivals, and traditional decorations',
  },
  {
    city: "Kennebunkport",
    state: "Maine",
    description:
      "Coastal town known for its beaches, seafood restaurants, and Bush family compound",
  },
  {
    city: "New Ulm",
    state: "Minnesota",
    description:
      "German heritage town famous for its glockenspiel, Hermann Monument, and Schell's Brewery",
  },
  {
    city: "Madrid",
    state: "New Mexico",
    description:
      "Former ghost town turned artistic community on the Turquoise Trail",
  },
  {
    city: "Ashland",
    state: "Oregon",
    description:
      "Home to the Oregon Shakespeare Festival and beautiful Lithia Park",
  },
  {
    city: "Beaufort",
    state: "South Carolina",
    description:
      "Antebellum coastal town with Spanish moss-draped streets and rich Gullah culture",
  },
  {
    city: "Skaneateles",
    state: "New York",
    description:
      "Pristine lakeside town in the Finger Lakes with historic boat tours and boutique shopping",
  },
  {
    city: "Skagway",
    state: "Alaska",
    description:
      "Historic Gold Rush town with preserved wooden boardwalks and White Pass & Yukon Route Railroad",
  },
  {
    city: "Jerome",
    state: "Arizona",
    description:
      "Former copper mining ghost town turned artist haven, perched on Cleopatra Hill",
  },
  {
    city: "Eureka",
    state: "California",
    description:
      "Victorian seaport with ornate Carson Mansion and Old Town district",
  },
  {
    city: "Silverton",
    state: "Colorado",
    description:
      "Historic mining town accessed by the Durango & Silverton Narrow Gauge Railroad",
  },
  {
    city: "Guilford",
    state: "Connecticut",
    description:
      "Coastal town with New England's largest town green and historic whitewashed houses",
  },
  {
    city: "Lewes",
    state: "Delaware",
    description:
      "First town in the First State, known for colonial architecture and Cape Henlopen State Park",
  },
  {
    city: "Cedar Key",
    state: "Florida",
    description:
      "Old Florida fishing village with artist communities and excellent seafood",
  },
  {
    city: "Helen",
    state: "Georgia",
    description:
      "Alpine-themed town in the Blue Ridge Mountains with Oktoberfest celebrations",
  },
  {
    city: "Hanalei",
    state: "Hawaii",
    description:
      "Tropical paradise town on Kauai with taro fields and crescent bay",
  },
  {
    city: "Sandpoint",
    state: "Idaho",
    description:
      "Lake town surrounded by mountains, known for skiing and water sports",
  },
  {
    city: "Bishop Hill",
    state: "Illinois",
    description:
      "Swedish utopian colony with preserved historic buildings and craft demonstrations",
  },
  {
    city: "Madison",
    state: "Indiana",
    description:
      "Ohio River town with the largest contiguous National Historic Landmark District in Indiana",
  },
  {
    city: "Pella",
    state: "Iowa",
    description:
      "Dutch-American town famous for its tulip festival and windmills",
  },
  {
    city: "Abilene",
    state: "Kansas",
    description: "Home of President Eisenhower and the Nickel Plate Railroad",
  },
  {
    city: "Bardstown",
    state: "Kentucky",
    description:
      "Bourbon capital of the world with Civil War museum and historic downtown",
  },
  {
    city: "Natchitoches",
    state: "Louisiana",
    description:
      "Oldest permanent settlement in Louisiana Purchase, known for meat pies and Steel Magnolias",
  },
  {
    city: "Camden",
    state: "Maine",
    description:
      "Picture-perfect harbor town with windjammer fleet and mountain backdrop",
  },
  {
    city: "Berlin",
    state: "Maryland",
    description:
      "America's Coolest Small Town with Victorian architecture and proximity to Assateague",
  },
  {
    city: "Stockbridge",
    state: "Massachusetts",
    description:
      "Norman Rockwell's hometown with famous Main Street and Berkshire culture",
  },
  {
    city: "Houghton",
    state: "Michigan",
    description:
      "Historic copper mining town on the Keweenaw Peninsula with winter carnival",
  },
  {
    city: "Red Wing",
    state: "Minnesota",
    description:
      "Mississippi River town known for shoes, pottery, and scenic bluffs",
  },
  {
    city: "Bay St. Louis",
    state: "Mississippi",
    description: "Artist haven on the Gulf Coast with French Colonial history",
  },
  {
    city: "Hannibal",
    state: "Missouri",
    description:
      "Mark Twain's boyhood home with riverboat cruises and literary sites",
  },
  {
    city: "Virginia City",
    state: "Montana",
    description: "Preserved 1860s gold mining town with boardwalks and saloons",
  },
  {
    city: "Valentine",
    state: "Nebraska",
    description:
      "Gateway to the Sandhills with Smith Falls and dark sky viewing",
  },
  {
    city: "Virginia City",
    state: "Nevada",
    description:
      "Historic Comstock Lode silver mining town with preserved Victorian buildings",
  },
  {
    city: "Wolfeboro",
    state: "New Hampshire",
    description: "America's oldest summer resort town on Lake Winnipesaukee",
  },
  {
    city: "Cape May",
    state: "New Jersey",
    description: "Victorian seaside resort with colorful gingerbread houses",
  },
  {
    city: "Truth or Consequences",
    state: "New Mexico",
    description: "Hot springs town that changed its name for a radio show",
  },
  {
    city: "Cooperstown",
    state: "New York",
    description: "Home of the Baseball Hall of Fame and Glimmerglass Opera",
  },
  {
    city: "Bath",
    state: "North Carolina",
    description:
      "State's oldest town with colonial architecture and pirate history",
  },
  {
    city: "Medora",
    state: "North Dakota",
    description:
      "Gateway to Theodore Roosevelt National Park with musical tribute show",
  },
  {
    city: "Put-in-Bay",
    state: "Ohio",
    description: "Lake Erie island community with Perry's Victory Monument",
  },
  {
    city: "Guthrie",
    state: "Oklahoma",
    description:
      "Victorian-era territorial capital with preserved architecture",
  },
  {
    city: "Joseph",
    state: "Oregon",
    description: "Artist community at the foot of the Wallowa Mountains",
  },
  {
    city: "Lititz",
    state: "Pennsylvania",
    description:
      "America's coolest small town with pretzel factory and chocolate spa",
  },
  {
    city: "Block Island",
    state: "Rhode Island",
    description: "Car-free island with Victorian hotels and dramatic bluffs",
  },
  {
    city: "Aiken",
    state: "South Carolina",
    description: "Winter Colony town known for horses and polo",
  },
  {
    city: "Hot Springs",
    state: "South Dakota",
    description: "Historic spa town near Mammoth Site and Wind Cave",
  },
  {
    city: "Jonesborough",
    state: "Tennessee",
    description: "Oldest town in Tennessee, known for storytelling festival",
  },
  {
    city: "Granbury",
    state: "Texas",
    description:
      "Preserved courthouse square with opera house and paranormal activity",
  },
  {
    city: "Panguitch",
    state: "Utah",
    description: "Historic brick town near Bryce Canyon with western charm",
  },
  {
    city: "Grafton",
    state: "Vermont",
    description:
      "Tiny preserved village with covered bridges and cheese company",
  },
  {
    city: "Abingdon",
    state: "Virginia",
    description: "Historic town with Barter Theatre and Virginia Creeper Trail",
  },
  {
    city: "La Conner",
    state: "Washington",
    description: "Artsy waterfront town known for tulip fields and galleries",
  },
  {
    city: "Lewisburg",
    state: "West Virginia",
    description: "Historic downtown with Carnegie Hall and Lost World Caverns",
  },
  {
    city: "Mineral Point",
    state: "Wisconsin",
    description:
      "Cornish mining town with artist studios and historic architecture",
  },
  {
    city: "Cody",
    state: "Wyoming",
    description: "Buffalo Bill's town with rodeo and western museums",
  },
  {
    city: "Sitka",
    state: "Alaska",
    description: "Former Russian capital with totem parks and eagle watching",
  },
  {
    city: "Oatman",
    state: "Arizona",
    description: "Route 66 ghost town with wild burros roaming the streets",
  },
  {
    city: "Ferndale",
    state: "California",
    description:
      'Victorian village with colorful "butterfat palaces" built by dairy farmers',
  },
  {
    city: "Ouray",
    state: "Colorado",
    description:
      'The "Switzerland of America" with natural hot springs and ice climbing',
  },
  {
    city: "Essex",
    state: "Connecticut",
    description: "River town with steam train and riverboat connection",
  },
  {
    city: "Milton",
    state: "Delaware",
    description: "Historic shipbuilding town with Dogfish Head Brewery",
  },
  {
    city: "Mount Dora",
    state: "Florida",
    description: "Antique capital with year-round festivals and lakeside charm",
  },
  {
    city: "St. Marys",
    state: "Georgia",
    description:
      "Gateway to Cumberland Island with wild horses and Spanish moss",
  },
  {
    city: "Paia",
    state: "Hawaii",
    description:
      "Colorful surfer town with boutiques and world-class windsurfing",
  },
  {
    city: "Stanley",
    state: "Idaho",
    description: "Gateway to Sawtooth Mountains with dark sky reserve",
  },
  {
    city: "New Harmony",
    state: "Indiana",
    description: "Utopian experimental community with historic labyrinth",
  },
  {
    city: "Story",
    state: "Indiana",
    description: "Timeless artist colony in Brown County with haunted inn",
  },
  {
    city: "Decorah",
    state: "Iowa",
    description:
      "Norwegian-American town with famous eagle cam and folk art school",
  },
  {
    city: "Lucas",
    state: "Kansas",
    description: "Folk art capital with Garden of Eden grassroots art site",
  },
  {
    city: "Berea",
    state: "Kentucky",
    description: "Folk arts and crafts capital with historic college",
  },
  {
    city: "Breaux Bridge",
    state: "Louisiana",
    description: "Crawfish capital of the world with Cajun music and culture",
  },
  {
    city: "Castine",
    state: "Maine",
    description:
      "Maritime town that's changed flags more times than any other US city",
  },
  {
    city: "St. Michaels",
    state: "Maryland",
    description: "Chesapeake Bay town with maritime museum and skipjacks",
  },
  {
    city: "Shelburne Falls",
    state: "Massachusetts",
    description: "Artist town with glacial potholes and Bridge of Flowers",
  },
  {
    city: "Saugatuck",
    state: "Michigan",
    description: "Art coast of Michigan with dune rides and beaches",
  },
  {
    city: "Grand Marais",
    state: "Minnesota",
    description: "Artist colony on Lake Superior with folk school",
  },
  {
    city: "Ocean Springs",
    state: "Mississippi",
    description: "Coastal art community with Walter Anderson Museum",
  },
  {
    city: "Rocheport",
    state: "Missouri",
    description: "Charming river town on the Katy Trail with wineries",
  },
  {
    city: "Philipsburg",
    state: "Montana",
    description: "Sapphire mining town with ghost town nearby",
  },
  {
    city: "Alliance",
    state: "Nebraska",
    description: "Home to Carhenge, a car replica of Stonehenge",
  },
  {
    city: "Tonopah",
    state: "Nevada",
    description: "Mining town with clown motel and stargazing",
  },
  {
    city: "Sugar Hill",
    state: "New Hampshire",
    description: "White Mountain town with lupine festival",
  },
  {
    city: "Lambertville",
    state: "New Jersey",
    description: "Delaware River art town paired with New Hope, PA",
  },
  {
    city: "Chama",
    state: "New Mexico",
    description: "Historic narrow-gauge railroad town in the Rockies",
  },
  {
    city: "Aurora",
    state: "New York",
    description: "Wells College town with MacKenzie-Childs pottery",
  },
  {
    city: "Ocracoke",
    state: "North Carolina",
    description: "Remote island with Blackbeard history and wild ponies",
  },
  {
    city: "Garrison",
    state: "North Dakota",
    description: "Lake Sakakawea town with Fort Stevenson",
  },
  {
    city: "Granville",
    state: "Ohio",
    description: "New England-style village with Denison University",
  },
  {
    city: "Medicine Park",
    state: "Oklahoma",
    description: "Cobblestone resort town in the Wichita Mountains",
  },
  {
    city: "Yachats",
    state: "Oregon",
    description: "Coastal gem with Thor's Well and tide pools",
  },
  {
    city: "Wellsboro",
    state: "Pennsylvania",
    description: "Gateway to PA Grand Canyon with gas-lit streets",
  },
  {
    city: "New Shoreham",
    state: "Rhode Island",
    description: "Block Island town with Southeast Lighthouse",
  },
  {
    city: "McClellanville",
    state: "South Carolina",
    description: "Shrimping village with Lowcountry charm",
  },
  {
    city: "Lead",
    state: "South Dakota",
    description: "Historic gold mining town with Sanford Lab",
  },
  {
    city: "Rugby",
    state: "Tennessee",
    description: "Historic district at the geographic center of old South",
  },
  {
    city: "Port Isabel",
    state: "Texas",
    description: "Coastal town with lighthouse and pirate museum",
  },
  {
    city: "Helper",
    state: "Utah",
    description: "Mining town turned art community with vintage gas stations",
  },
  {
    city: "Chester",
    state: "Vermont",
    description: "Stone Village and stone house architecture",
  },
  {
    city: "Tangier",
    state: "Virginia",
    description: "Chesapeake Bay island with unique dialect",
  },
  {
    city: "Dayton",
    state: "Washington",
    description: "Oldest train depot in the state with historic Main Street",
  },
  {
    city: "Thomas",
    state: "West Virginia",
    description: "Former coal town turned art community with music venues",
  },
  {
    city: "New Glarus",
    state: "Wisconsin",
    description: "Little Switzerland with brewery and folk museum",
  },
  {
    city: "Thermopolis",
    state: "Wyoming",
    description: "World's largest mineral hot springs with bison viewing",
  },
];


module.exports = {
  BADGES,
  GEMS,
  INTERESTS
}
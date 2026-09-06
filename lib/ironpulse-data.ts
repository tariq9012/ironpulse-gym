export const images = {
  hero: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=2200&q=85',
  gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=85',
  strength: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1400&q=85',
  group: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=85',
  athlete: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1400&q=85',
  trainer: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85',
  lifestyle: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1400&q=85',
  recovery: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=85',
  boxing: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1400&q=85',
  cardio: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1400&q=85',
}

export const trainers = [
  { slug: 'ahmed-khan', name: 'Ahmed Khan', role: 'Strength & Conditioning Coach', experience: '11 years', specialty: 'Strength', image: images.trainer, tags: ['Powerlifting', 'Athletic prep', 'Mobility'], bio: 'Ahmed builds durable athletes through intelligent progressive overload and a coaching style that meets people where they are.', certifications: ['NSCA CSCS', 'USA Weightlifting L2', 'Precision Nutrition L1'] },
  { slug: 'sarah-malik', name: 'Sarah Malik', role: 'HIIT & Performance Coach', experience: '8 years', specialty: 'Performance', image: images.athlete, tags: ['HIIT', 'Conditioning', 'Running'], bio: 'Sarah turns effort into momentum with high-energy sessions that make every minute count.', certifications: ['NASM CPT', 'Kettlebell Concepts', 'First Aid + CPR'] },
  { slug: 'hamza-ali', name: 'Hamza Ali', role: 'Boxing Coach', experience: '14 years', specialty: 'Boxing', image: images.boxing, tags: ['Boxing', 'Footwork', 'Conditioning'], bio: 'Hamza brings technical boxing, disciplined footwork, and a champion mindset to every round.', certifications: ['USA Boxing Coach', 'Muay Thai Level 2', 'NASM CPT'] },
]

export const programs = [
  { slug: 'strength-training', title: 'Strength Training', short: 'Build a body that performs.', copy: 'Progressive training, expert coaching, and lasting results for a stronger life.', image: images.strength, difficulty: 'All levels', duration: '60 min', trainer: 'Ahmed Khan', category: 'Strength', benefits: ['Build lean strength', 'Improve movement quality', 'Train with a clear progression'] },
  { slug: 'hiit', title: 'HIIT', short: 'Raise your ceiling.', copy: 'High-output sessions that make hard work feel rewarding.', image: images.athlete, difficulty: 'Intermediate', duration: '45 min', trainer: 'Sarah Malik', category: 'Conditioning', benefits: ['Improve cardiovascular fitness', 'Build work capacity', 'Burn energy efficiently'] },
  { slug: 'cross-training', title: 'Cross Training', short: 'Be ready for anything.', copy: 'A varied blend of strength, conditioning, and functional movement.', image: images.group, difficulty: 'All levels', duration: '55 min', trainer: 'Sarah Malik', category: 'Functional', benefits: ['Move with confidence', 'Train every energy system', 'Stay engaged and consistent'] },
  { slug: 'boxing', title: 'Boxing', short: 'Find your rhythm.', copy: 'Technical coaching, conditioning, and rounds that sharpen your edge.', image: images.boxing, difficulty: 'All levels', duration: '60 min', trainer: 'Hamza Ali', category: 'Boxing', benefits: ['Learn real fundamentals', 'Develop speed and balance', 'Build total-body conditioning'] },
  { slug: 'yoga-mobility', title: 'Yoga / Mobility', short: 'Move better. Recover deeper.', copy: 'Restore range, control, and calm with focused movement sessions.', image: images.recovery, difficulty: 'All levels', duration: '45 min', trainer: 'Sarah Malik', category: 'Recovery', benefits: ['Improve flexibility', 'Reduce training friction', 'Recover with intention'] },
  { slug: 'personal-training', title: 'Personal Training', short: 'Your plan. Your pace.', copy: 'One-to-one coaching built around your goals, schedule, and starting point.', image: images.trainer, difficulty: 'All levels', duration: '60 min', trainer: 'Ahmed Khan', category: 'Coaching', benefits: ['A plan built for you', 'Direct coaching feedback', 'Accountability that lasts'] },
]

export const classes = [
  ['Monday', '06:00', 'Strength', 'Ahmed Khan', '8 spots', 'All levels'], ['Monday', '08:00', 'HIIT', 'Sarah Malik', '3 spots', 'Intermediate'], ['Monday', '18:00', 'Boxing', 'Hamza Ali', '5 spots', 'All levels'],
  ['Tuesday', '07:00', 'Mobility', 'Sarah Malik', '10 spots', 'All levels'], ['Tuesday', '17:30', 'Cross Training', 'Ahmed Khan', '6 spots', 'Intermediate'], ['Tuesday', '19:00', 'Strength', 'Ahmed Khan', '4 spots', 'All levels'],
  ['Wednesday', '06:00', 'HIIT', 'Sarah Malik', '2 spots', 'Intermediate'], ['Wednesday', '18:00', 'Boxing', 'Hamza Ali', '7 spots', 'All levels'], ['Thursday', '08:00', 'Strength', 'Ahmed Khan', '9 spots', 'All levels'], ['Friday', '17:30', 'Cross Training', 'Sarah Malik', '4 spots', 'Intermediate'], ['Saturday', '09:00', 'Boxing', 'Hamza Ali', '5 spots', 'All levels'], ['Sunday', '10:00', 'Mobility', 'Sarah Malik', '12 spots', 'All levels'],
]

export const stories = [
  { name: 'Maya Rodriguez', duration: '12 months', goal: 'Strength transformation', program: 'Strength Training', quote: 'I stopped training for a number on a scale and started training for the life I wanted.', image: images.strength },
  { name: 'David Chen', duration: '8 months', goal: 'Performance reset', program: 'Cross Training', quote: 'The structure made consistency feel possible. The community made it feel inevitable.', image: images.athlete },
  { name: 'Nadia Brooks', duration: '6 months', goal: 'Confidence through boxing', program: 'Boxing', quote: 'Every round gave me a little more of myself back.', image: images.boxing },
]

export const articles = [
  { slug: 'build-a-stronger-foundation', category: 'Strength', title: 'Build a stronger foundation before you chase more', excerpt: 'The principles that make progressive training sustainable, measurable, and rewarding.', read: '6 min read', author: 'Ahmed Khan', image: images.strength },
  { slug: 'recovery-is-training', category: 'Recovery', title: 'Recovery is training', excerpt: 'Why the work between sessions is where your next level is built.', read: '4 min read', author: 'Sarah Malik', image: images.recovery },
  { slug: 'your-first-week-at-the-gym', category: 'Beginner Guides', title: 'Your first week at the gym, without the guesswork', excerpt: 'A simple starting point for showing up with confidence.', read: '5 min read', author: 'IronPulse Team', image: images.gym },
  { slug: 'boxing-for-total-fitness', category: 'Workout', title: 'Why boxing belongs in every fitness plan', excerpt: 'Footwork, focus, and fitness in one endlessly rewarding practice.', read: '7 min read', author: 'Hamza Ali', image: images.boxing },
  { slug: 'nutrition-that-supports-the-work', category: 'Nutrition', title: 'Nutrition that supports the work', excerpt: 'A practical approach to fueling hard sessions and real life.', read: '8 min read', author: 'IronPulse Team', image: images.lifestyle },
]

export const gallery = [
  ['Gym', images.gym, 'The training floor'], ['Training', images.strength, 'Earn every rep'], ['Classes', images.group, 'Train together'], ['Trainers', images.trainer, 'Coaching that sees you'], ['Events', images.athlete, 'More than a workout'], ['Community', images.lifestyle, 'The standard is shared'],
]

export const facilities = [
  ['Strength Zone', 'Competition-grade racks, platforms, and free weights for focused progression.', images.strength], ['Cardio Zone', 'Curated machines and open space to build an engine that lasts.', images.cardio], ['Functional Training', 'Turf, sleds, kettlebells, and the tools to move with intent.', images.group], ['Boxing Area', 'Heavy bags, a full ring, and expert coaching for every level.', images.boxing], ['Recovery Zone', 'A quieter place to reset, stretch, and take care of the work.', images.recovery], ['Locker Rooms', 'Thoughtful essentials, clean lines, and everything between sessions.', images.gym], ['Showers', 'Fresh, private, and ready for your next move.', images.lifestyle], ['Lounge', 'A place to refuel, connect, and make the gym feel like yours.', images.hero],
]

export const navItems = [['Programs', '/programs'], ['Classes', '/classes'], ['Memberships', '/memberships'], ['Trainers', '/trainers'], ['Transformations', '/transformations'], ['Facilities', '/facilities'], ['Journal', '/blog'], ['Contact', '/contact']] as const

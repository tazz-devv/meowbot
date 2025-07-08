module.exports = {
    cats: {},
    fishcoins: {},
    inventory: {},
    lastDaily: {},
    lockedChannels: new Set(),

    breeds: [
        { name: 'Tabby', bonus: { hunger: -5, happiness: 5, strength: 1 } },
        { name: 'Siamese', bonus: { happiness: 10, strength: 2 } },
        { name: 'Persian', bonus: { hunger: 10, strength: 0 } },
        { name: 'Maine Coon', bonus: { hunger: -10, happiness: 10, strength: 3 } },
        { name: 'Bengal', bonus: { happiness: 15, strength: 4 } },
        { name: 'Sphynx', bonus: { hunger: 15, strength: 1 } },
        { name: 'Ragdoll', bonus: { happiness: 20, strength: 2 } },
        { name: 'Scottish Fold', bonus: { hunger: -5, strength: 1 } },
        { name: 'Russian Blue', bonus: { hunger: -10, strength: 2 } },
        { name: 'Savannah', bonus: { hunger: -15, happiness: 15, strength: 5 } }
    ],

    shopItems: [
        { name: 'tuna', price: 10, type: 'food', hunger: 20, emoji: '🐟' },
        { name: 'salmon', price: 15, type: 'food', hunger: 30, emoji: '🍣' },
        { name: 'premium_food', price: 50, type: 'food', hunger: 50, happiness: 10, emoji: '🍗' },
        { name: 'rare_treat', price: 150, type: 'food', hunger: 30, happiness: 30, emoji: '🍬' },
        
        { name: 'ball', price: 5, type: 'toy', happiness: 10, emoji: '🎾' },
        { name: 'catnip', price: 25, type: 'toy', happiness: 40, emoji: '🌿' },
        { name: 'laser_pointer', price: 30, type: 'toy', happiness: 25, emoji: '🔦' },
        { name: 'yarn', price: 15, type: 'toy', happiness: 20, emoji: '🧶' },
        
        { name: 'cat_bed', price: 100, type: 'furniture', happiness: 30, emoji: '🛏️' },
        { name: 'scratching_post', price: 75, type: 'furniture', happiness: 25, emoji: '🐾' },
        { name: 'cat_tree', price: 500, type: 'furniture', happiness: 50, emoji: '🌳' },
        { name: 'fountain', price: 300, type: 'furniture', hunger: -20, emoji: '⛲' },
        
        { name: 'breed_change', price: 200, type: 'special', emoji: '🔄' },
        { name: 'collar', price: 40, type: 'special', happiness: 15, emoji: '⛓️' }
    ],

    catNames: ['Whiskers', 'Mittens', 'Shadow', 'Luna', 'Bella', 'Oliver', 'Leo', 'Lucy', 'Max', 'Lily', 'Charlie', 'Chloe', 'Milo', 'Sophie', 'Simba', 'Cleo', 'Tiger', 'Loki', 'Oreo', 'Jasper'],

    catFacts: [
        'Cats sleep 70% of their lives',
        'A cat\'s purr may have healing properties',
        'Cats can make over 100 different sounds',
        'A cat\'s nose print is unique like a human fingerprint',
        'Cats can run up to 30 mph',
        'Cats have 32 muscles in each ear',
        'A group of cats is called a clowder',
        'Cats can jump up to 6 times their length',
        'Cats have a third eyelid called a haw',
        'The oldest known pet cat existed 9,500 years ago'
    ]
};

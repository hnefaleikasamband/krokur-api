const mongoose = require('mongoose');
const config = require('./config/main').default;
const Club = require('./models/club').default;
const Athlete = require('./models/athlete').default;
const Bout = require('./models/bout').default;
const User = require('./models/user').default;
const AthleteData = require('./data/athletes');
const ClubData = require('./data/clubs');
const UserData = require('./data/users');


mongoose.connect(config.database)
    .then( async dbCon => {
        console.log('Connected to MongoDB, time to seed');
        await seed();
        mongoose.disconnect();
    }, reason => {
        console.log('Error connecting to database for seeding');
    })
    .catch( error => {
        console.log('dbSeeder threw an error: ', error);
    });


async function seed() {
    console.log('Seeding demo data...');
    try {
        console.log('\n... Working with Clubs');
        await emptyClubs();
        await seedClubs();

        console.log('\n... Working with Athletes');
        await emptyAthletes();
        await seedAthletes();

        console.log('\n... Working with Users');
        await emptyUsers();
        await seedUsers();

    } catch (error) {
        console.log('Caught an error:', error);
    }
}

async function seedClubs() {
    await Promise.all(ClubData.clubs.map( data => addClub(data)));
}

function addClub(data) {
    return new Promise( (resolve, reject) => {
        const club = new Club({
            name: data.name,
            shorthand: data.shorthand,
            info: data.info
        });

        club.save( (err,  clb) => {
            if (err) reject(err);
            else {
                console.log(`Inserted club: ${clb.name}(${clb.shorthand}),\t info ${clb.info}`);
                resolve();
            }
        });
    });
}

function emptyClubs() {
    return new Promise( (resolve, reject) => {
        Club.remove({}, err => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function seedAthletes() {
    await Promise.all(AthleteData.athletes.map( data => addAthlete(data)));
}

function addAthlete(data) {
    return new Promise( (resolve, reject) => {
        const athlete = new Athlete({
            name: data.name,
            ssn: data.ssn,
            club: data.club,
            achievements: data.achievements ? data.achievements : undefined
        });

        athlete.save( (err,  athlt) => {
            if (err) reject(err);
            else {
                console.log(`Inserted athlete: ${athlt.name}(${athlt.ssn}),\t club: ${athlt.club}`);
                resolve();
            }
        });
    });
}

async function emptyAthletes() {
    return new Promise( (resolve, reject) => {
        Athlete.remove({}, err => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function seedUsers() {
    await Promise.all(UserData.users.map( data => addUser(data)));
}

function addUser(data) {
    return new Promise( (resolve, reject) => {
        const user = new User({
            email: data.email,
            password: data.password,
            name: data.name,
            club: data.club ? data.club : undefined,
            disabled: data.disabled
        });

        user.save( (err, usr) => {
            if (err) reject(err);
            else {
                console.log(`Inserted user: ${usr.name}(${usr.email}),\t club: ${usr.club},\t disabled: ${usr.disabled}`);
                resolve();
            }
        });
    });
}

async function emptyUsers() {
    return new Promise( (resolve, reject) => {
        User.remove({}, err => {
            if (err) reject(err);
            else resolve();
        });
    });
}
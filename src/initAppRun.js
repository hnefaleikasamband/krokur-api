const User = require('./models/user').default;

function addUser(data) {
  return new Promise((resolve, reject) => {
    const {
      email, password, name, club, disabled,
    } = data;
    const user = new User({
      email,
      password,
      name,
      club,
      disabled,
    });

    user.save((err, usr) => {
      if (err) reject(err);
      else {
        console.log(`Inserted Super User: ${usr.name}(${usr.email}),\t disabled: ${usr.disabled}`);
        resolve();
      }
    });
  });
}

async function addSuperUser() {
  User.find({}, async (err, users) => {
    if (err) {
      console.log('... Error fetching users in super user check');
    } else if (users && users.length <= 0) {
      try {
        const superAdmin = {
          email: 'admin@admin.is',
          password: 'admin',
          name: 'Administrator',
          disabled: 'false',
        };
        await addUser(superAdmin);
      } catch (error) {
        console.log('... Caught an error while trying to add superuser');
      }
    } else {
      console.log('... There are some users already in the database');
    }
  });
}

const init = async () => {
  try {
    console.log('... Connected to MongoDB, time to check for super user');
    await addSuperUser();
  } catch (error) {
    console.log('... Error caught when trying to run super user init');
    console.log(error);
  }
};

export default init;

import users from "/var/www/html/public/3dpaws/users.json" assert {type: "json"};

const genAPIKey = () => {
   // create a base-36 string that contains 30 chars in a-z,0-9

   return [...Array(30)]
   .map((e) => ((Math.random() * 36) | 0).toString(36))
   .join('');
};

//import users from "/var/www/html/public/3dpaws/users.js";

export const createUser = (_username, req) => {
  let today = new Date().toISOString().split('T')[0];
  let user = {
    _id: Date.now(),
    api_key: genAPIKey(),
    username: _username,
    usage:  [{ date: today, count: 0 }],
  };

  console.log('add user');
  users.push(user);
  return user;
};

export const authenticateKey = (req, res, next) => {
  let api_key = req.header("x-api-key"); //Add API key to headers
  let account = users.find((user) => user.api_key == api_key);
  console.log('entering authenticate key');
  console.log(`account: ${account}`);
  console.log(`api_key: ${api_key}`);
  // find() returns an object or undefined
  if (account) {
    //If API key matches
    //check the number of times the API has been used in a particular day
    let today = new Date().toISOString().split("T")[0];
    let usageCount = account.usage.findIndex((day) => day.date == today);
    //let usageCount = 0;
    let MAX = 100;
    console.log('inside account if');
    console.log(`usage count  ${usageCount}`);
    console.log(`${today}`);
    if (usageCount >= 0) {
       //If API is already used today
       console.log('inside usageCount if');
       if (usageCount >= MAX) {
         console.log('usage is greater than max');
         //stop is the usage exceeds max API calls
         res.status(429).send({
           error: {
             code: 429,
             message: "Max API calls exceeded.",
           },
         });
       } else {
          // have not hit todays max usage
          account.usage[usageCount].count++;
          console.log("Good API call", account.usage[usageCount]);
          next();
         }
       } else {
         //Push todays's date and count: 1 if there is a past date
         account.usage.push({ date: today, count: 1 });
         //ok to use again
         next();
       }
    } else {
       //Reject request if API key doesn't match
       res.status(403).send({ error: { code: 403, message: "You not allowed." } });
    }
  }
//};
//module.exports = { createUser, authenticateKey };


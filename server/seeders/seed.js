const db = require('../config/connection');
const { User, Com, Review, Thread, Like } = require('../models');
const userSeeds = require('./userSeeds.json');
const threadSeeds = require('./threadSeeds.json');
const reviewSeeds = require('./reviewSeeds.json');
const comSeeds = require('./comSeeds.json');

db.once('open', async () => {
  try {
    await User.deleteMany({});
    await Com.deleteMany({});
    await Thread.deleteMany({});
    await Review.deleteMany({});
    await Like.deleteMany({});

    await User.create(userSeeds);

    //index map:
    //0: Jame's thread
    //1: Kolt's thread
    var threadIDs = [];
    var parentIDs = [];

    for (let i = 0; i < threadSeeds.length; i++) {
      const { _id } = await Thread.create(threadSeeds[i]);

      if ( i === 0 ) {
        const user = await User.findOneAndupdate(
          { username: "JimothyS" },
          {
            $addToSet: {
              userThreads: _id
            }
          }
        );
        const updateThread = await Thread.findOneAndupdate(
          { _id: _id },
          {
            author: user._id
          }
        );
      } else {
        const user = await User.findOneAndupdate(
          { username: "Eden" },
          {
            $addToSet: {
              userThreads: _id
            }
          }
        );

        
        const updateThread = await Thread.findOneAndupdate(
          { _id: _id },
          {
            author: user._id
          }
        );
      };

      threadIDs.push(_id);
      parentIDs.push({ id: _id, type: "Thread" });
    };
    for (let i = 0; i < reviewSeeds.length; i++) {
      const { _id, author } = await Review.create(reviewSeeds[i]);

      const threadID = (author === "JimothyS") ? 0 : (author === "Eden") ? 1 : null;

      const user = await User.findOneAndUpdate(
        { username: author },
        {
          $addToSet: {
            reviews: _id
          }
        }
      );

      const thread = await Thread.findOneAndUpdate(
        { _id: threadIDs[threadID] },
        {
          $addToSet: {
            reviews: _id
          }
        }
      );

      parentIDs.push({ id: _id, type: "Review" });
    }

    for (let i = 0; i < comSeeds.length; i++) {
      const { _id, author } = await Com.create(comSeeds[i]);

      const user = await User.findOneAndUpdate(
        { username: author },
        {
          $addToSet: {
            coms: _id
          }
        }
      );

      parentIDs.push({ id: _id, type: "Com" });

      const currentParent = Math.floor(Math.random() * (parentIDs.length - 2));

      const com = await Com.findOneAndUpdate(
        { _id: parentIDs[parentIDs.length - 1] },
        {
          parent: parentIDs[currentParent].id
        }
      );
      switch(parentIDs[currentParent].type) {
        case "Thread": {
          const addThread = await Thread.findOneAndupdate(
            { _id: parentIDs[currentParent].id},
            {
              $addToSet: {
                com: _id
              }
            }
          );
          break;
        }
        case "Review": {
          const addReview = await Review.findOneAndupdate(
            { _id: parentIDs[currentParent].id},
            {
              $addToSet: {
                com: _id
              }
            }
          );
          break;
        }
        case "Com": {
          const addCom = await Com.findOneAndupdate(
            { _id: parentIDs[currentParent].id},
            {
              $addToSet: {
                com: _id
              }
            }
          );
          break;
        }
      }
    }
    console.log('all done!');
    process.exit(0);
  } catch (err) {
    throw err;
  }
});





const { User, Thread, Review, Com } = require('../models');
const { ObjectId } = require('mongodb');
const { signToken } = require('../utils/auth');

const resolvers = {
  // Com: {
  //   parent: async (com) => {
  //     const ParentModel = mongoose.model(com.parentType);
  //     return await ParentModel.findById(com.parent);
  //   },
  // },
  // Review: {
  //   parent: async (com) => {
  //     const ParentModel = mongoose.model(com.parentType);
  //     return await ParentModel.findById(com.parent);
  //   },
  // },
  // Thread: {
  //   parent: async (com) => {
  //     const ParentModel = mongoose.model(com.parentType);
  //     return await ParentModel.findById(com.parent);
  //   },
  // },


  Query: {
    // thread: async (parent, { threadId }) => {
    //   return Thread.findOne({ _id: threadId });
    // },
    // userThreads: async (parent, { userId }) => {
    //   return Thread.find({ threadAuthor: userId });
    // },
    // friend: async (parent, { userId }) => {
    //   return User.findOne({ _id: userId });
    // },
    // friends: async (parent, { userId }) => {
    //   return User.findOne({ _id: userId }).populate('friends');
    // },

    me: async () => {
      try {
        const user = await User.findById(userId)
          .populate('friends', '_id username')
          .populate('reviews', '_id timestamp type title text rating likes')
          .populate('userThreads', '_id timestamp title likes')
          .populate('savedThreads', '_id timestamp title likes')
          .populate({
            path: 'likes',
            populate: {
              path: 'likedContent',
              select: '_id timestamp title likes',
              populate: [
                { path: 'author', select: '_id username' },
                { path: 'parent', select: '_id timestamp title likes' }
              ]
            }
          })
          .populate({
            path: 'coms',
            populate: [
              { path: 'author', select: '_id username' },
              { path: 'parent', select: '_id timestamp title likes' }
            ]
          });

        return user;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch user');
      }
    },

    threads: async () => {
      try {
        const allThreads = await Thread.find(); // Assuming you have a model called "Thread"
        return allThreads;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch threads');
      }
    },

    userThreads: async (_, { userId }) => {
      try {
        const userThreads = await Thread.find({ author: userId });
        return userThreads;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch user threads');
      }
    },

    singleThread: async (_, { threadId }) => {
      try {
        const thread = await Thread.findById(threadId)
          .populate('author')
          .populate({
            path: 'reviews',
            populate: {
              path: 'coms',
              populate: {
                path: 'author',
              },
            },
          })
          .populate({
            path: 'coms',
            populate: {
              path: 'author',
            },
          });
        return thread;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch thread');
      }
    },

    reviews: async () => {
      try {
        const allReviews = await Review.find();
        return allReviews;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch reviews');
      }
    },

    singleReview: async (_, { reviewId }) => {
      try {
        const review = await Review.findById(reviewId).populate({
          path: 'coms',
          populate: {
            path: 'author',
            model: 'User'
          }
        });
        if (!review) {
          throw new Error('Review not found');
        }
        return review;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch review');
      }
    },

    reviewComs: async (_, { reviewId }) => {
      try {
        const review = await Review.findById(reviewId);
        if (!review) {
          throw new Error('Review not found');
        }

        // Fetch comments and replies for the review
        const comments = await Com.find({
          parent: reviewId,
          parentType: 'Review',
        }).populate('author');

        return comments;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch comments');
      }
    },

    threadComs: async (_, { threadId }) => {
      try {
        const thread = await Thread.findById(threadId);
        if (!thread) {
          throw new Error('Thread not found');
        }

        // Fetch comments and replies for the thread
        const comments = await Com.find({
          parent: threadId,
          parentType: 'Thread',
        }).populate('author');

        return comments;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch comments');
      }
    },

    replyComs: async (parent, _, { Com }) => {
      try {
        const comments = await Com.find({ parent: parent._id, parentType: 'Comment' }).populate('author');
        return comments;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch comments');
      }
    },

  },

  Mutation: {
    // WORKS---------------------------------------------------------------------
    addUser: async (parent, args) => {
      const user = await User.create(args);
      console.log(user);
      const token = signToken(user);
      console.log(token);
      return { token, user };
    },
    // WORKS---------------------------------------------------------------------

    // WORKS---------------------------------------------------------------------
    login: async (parent, { username, password }) => {
      console.log("backend");
      const user = await User.findOne({ username });

      if (!user) {
        throw new AuthenticationError('No profile with this username found!');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect password!');
      }

      const token = signToken(user);
      return { token, user };
    },
    // WORKS---------------------------------------------------------------------

    likeThread: async (parent, { threadId }) => {
      try {
        const updatedThread = await Thread.findOneAndUpdate(
          { _id: threadId },
          { $inc: { likes: 1 } },
          { new: true }
        );
        return updatedThread;
      } catch (err) {
        console.error(err);
      }
    },
    unlikeThread: async (parent, { threadId }) => {
      try {
        const updatedThread = await Thread.findOneAndUpdate(
          { _id: threadId },
          { $inc: { likes: -1 } },
          { new: true }
        );
        return updatedThread;
      } catch (err) {
        console.error(err);
      }
    },
    likeCom: async (parent, { comId }) => {
      try {
        const updatedCom = await Com.findOneAndUpdate(
          { _id: comId },
          { $inc: { likes: 1 } },
          { new: true }
        );
        return updatedCom;
      } catch (err) {
        console.error(err);
      }
    },
    unlikeCom: async (parent, { comId }) => {
      try {
        const updatedCom = await Com.findOneAndUpdate(
          { _id: comId },
          { $inc: { likes: -1 } },
          { new: true }
        );
        return updatedCom;
      } catch (err) {
        console.error(err);
      }
    },
    likeReview: async (parent, { reviewId }) => {
      try {
        const updatedReview = await Review.findOneAndUpdate(
          { _id: reviewId },
          { $inc: { likes: 1 } },
          { new: true }
        );
        return updatedReview;
      } catch (err) {
        console.error(err);
      }
    },
    unlikeReview: async (parent, { reviewId }) => {
      try {
        const updatedReview = await Review.findOneAndUpdate(
          { _id: reviewId },
          { $inc: { likes: -1 } },
          { new: true }
        );
        return updatedReview;
      } catch (err) {
        console.error(err);
      }
    },
    saveThread: async (parent, { userId, threadId }) => {
      try {
        const savedThread = await User.findOneAndUpdate(
          { _id: userId },
          { $addToSet: { savedThreads: { _id: threadId } } },
          { new: true }
        );
        return savedThread;
      } catch (err) {
        console.error(err);
      }
    },

    // WORKS---------------------------------------------------------------------
    deleteThread: async (parent, { threadId }) => {
      try {
        const deletedThread = await Thread.findOneAndDelete({ _id: threadId });
        return deletedThread;
      } catch (err) {
        console.error(err);
      }
    },
    // WORKS---------------------------------------------------------------------

    // WORKS---------------------------------------------------------------------
    addThreadCom: async (parent, { threadId, comText, comAuthor }, { models }) => {
      try {
        const thread = await Thread.findById(threadId);
        if (!thread) {
          throw new Error('thread not found');
        }

        // Create a new comment
        const comment = new Com({
          text: comText,
          author: comAuthor,
          parentType: 'Thread', // Provide the appropriate value for parentType
          parent: threadId, // Provide the appropriate value for parent
          timestamp: new Date(), // Provide the appropriate value for timestamp
        });

        await comment.save();

        // Update the reference in the review
        thread.coms.push(comment);
        await thread.save();

        return comment;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to add comment to thread');
      }
    },
    // WORKS---------------------------------------------------------------------

    // WORKS---------------------------------------------------------------------
    deleteThreadCom: async (parent, { threadId, comId }) => {
      return Thread.findOneAndDelete(
        { _id: threadId },
        { $pull: { com: { _id: comId } } },
        { new: true }
      );
    },
    // WORKS---------------------------------------------------------------------

    // Add a friend
    addFriend: async (parent, { userId, friendId }) => {
      return User.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { friends: { _id: friendId } } },
        { new: true }
      );
    },
    // Delete a friend
    deleteFriend: async (parent, { userId, friendId }) => {
      return User.findOneAndUpdate(
        { _id: userId },
        { $pull: { friends: { _id: friendId } } },
        { new: true }
      );
    },

    // create a thread
    // WORKS---------------------------------------------------------------------
    addThread: async (parent, { title, username }) => {
      try {
        // Find the user by username
        const author = await User.findOne({ username });

        // Create the thread with the provided title and author
        const thread = new Thread({
          title,
          description,
          author,
          likes: 0,
          timestamp: Date.now(),
          reviews: [],
          coms: [],
        });

        // Save the thread to the database
        const savedThread = await thread.save();

        // Update the savedThreads array for the author
        author.savedThreads.push(savedThread);
        await author.save();

        // Return the created thread
        return savedThread;
      } catch (err) {
        console.error(err);
      }
    },
    // WORKS---------------------------------------------------------------------

    updateThread: async (parent, { threadId, title }) => {
      return Thread.findOneAndUpdate(
        { _id: threadId },
        { $set: { title, description } },
        { new: true }
      );
    },

    // WORKS---------------------------------------------------------------------
    addReview: async (_, { authorId, title, text, threadId }, { models }) => {
      try {
        const author = await User.findById(authorId);
        if (!author) {
          throw new Error('Author not found');
        }

        const thread = await Thread.findById(threadId);
        if (!thread) {
          throw new Error('Thread not found');
        }

        const review = new Review({
          author,
          title,
          text,
          thread,
          date: new Date(), // Example: Set the current date as the value for the 'date' field
          rating: 0, // Example: Set a rating value
          type: 'Media', // Example: Set a type value
          timestamp: Date.now() // Example: Set the current timestamp as the value for the 'timestamp' field
        });

        await review.save();

        // Update references
        author.reviews.push(review);
        await author.save();

        thread.reviews.push(review);
        await thread.save();

        return review;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to add review');
      }
    },
    // WORKS---------------------------------------------------------------------

    updateReview: async (parent, { reviewId, text }) => {
      return Review.findOneAndUpdate(
        { _id: reviewId },
        { $set: { text } },
        { new: true }
      );
    },

    // WORKS---------------------------------------------------------------------
    addReviewCom: async (parent, { reviewId, comText, comAuthor }, { models }) => {
      try {
        const review = await Review.findById(reviewId);
        if (!review) {
          throw new Error('Review not found');
        }

        // Create a new comment
        const comment = new Com({
          text: comText,
          author: comAuthor,
          parentType: 'Review', // Provide the appropriate value for parentType
          parent: reviewId, // Provide the appropriate value for parent
          timestamp: new Date(), // Provide the appropriate value for timestamp
        });

        await comment.save();

        // Update the reference in the review
        review.coms.push(comment);
        await review.save();

        return comment;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to add comment to review');
      }
    },
    // WORKS---------------------------------------------------------------------

    // WORKS---------------------------------------------------------------------
    deleteReview: async (parent, { reviewId }) => {
      try {
        // Find the review and store it in deletedReview variable
        const deletedReview = await Review.findOneAndDelete({ _id: reviewId });

        // Delete the associated comments
        await Comment.deleteMany({ reviewId: deletedReview._id });

        // Return the deleted review
        return deletedReview;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to delete review');
      }
    },
    // WORKS---------------------------------------------------------------------

    // WORKS---------------------------------------------------------------------
    deleteReviewCom: async (parent, { reviewId, comId }) => {
      return Review.findOneAndUpdate(
        { _id: reviewId },
        { $pull: { com: { _id: comId } } },
        { new: true }
      );
    },
    // WORKS---------------------------------------------------------------------



    //MAL API URL: https://api.myanimelist.net/v2/(manga or anime)?q=(name of show or manga)
    //TMDB API URL: https://api.themoviedb.org/3/search/('tv' or 'movie')?query=(name of show or movie)&include_adult=false&language=en-US&page=1
    //RAWG API URL: `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&page=1&search=(name of game)&exclude_additions=true&page_size=10`
    //Google Books API URL: https://www.googleapis.com/books/v1/volumes?q=(name of book)

    handleAPICall: async (parent, { searchInput, selectedWord }) => {
      switch (selectedWord) {
        case 'Video Games': {
          axios
            .get(`https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&page=1&search=${searchInput}&exclude_additions=true&page_size=10`)
            .then((res) => {

              if (!res.ok) {
                throw new Error('RAWG API ERROR: Something went wrong.');
              };

              const rawgData = res.results.map((game) => ({
                type: selectedWord,
                image: game.background_image,
                title: game.name,
                releaseDate: game.released,
                id: game.id
              }));

              setSearchResults(rawgData);
            })
            .catch((err) => {
              console.log(err);
            });

          break;
        }
        case 'Movie' || 'Show': {
          var searchType;

          if (selectedWord === 'Movie') {
            searchType = 'movie';
          } else {
            searchType = 'tv';
          };

          axios
            .get(`https://api.themoviedb.org/3/search/${searchType}?query=${searchInput}&include_adult=false&language=en-US&page=1`)
            .then((res) => {

              if (!res.ok) {
                throw new Error('TMDb ERROR: Something went wrong.');
              };

              const tmdbData = res.results.map((media) => ({
                type: selectedWord,
                backdrop: `https://image.tmdb.org/t/p/w500/${media.backdrop_path}` || 'No backdrop.',
                image: `https://image.tmdb.org/t/p/w500/${media.poster_path}` || 'No image.',
                title: media.name,
                description: media.overview || 'No description.',
                releaseDate: media.first_air_date || 'Release date unavailable.'
              }));

              setSearchResults(tmdbData);
            })
            .catch((err) => {
              console.log(err);
            });

          break;
        }
        case 'Anime' || 'Manga': {
          axios
            .get(`https://api.myanimelist.net/v2/${selectedWord.toLowerCase()}?q=${searchInput}`, {
              headers: {
                'X-MAL-CLIENT-ID': `${process.env.MAL_CLIENT_ID}`
              }
            })
            .then((res) => {

              if (!res.ok) {
                throw new Error('MAL_API ERROR: Something went wrong.');
              };

              const weebData = res.data.map((media) => ({
                type: selectedWord,
                title: media.node.title,
                image: media.node?.main_picture.large || 'No image.'
              }));

              setSearchResults(weebData);
            })
            .catch((err) => {
              console.log(err);
            });

          break;
        }
        case 'Book': {
          axios
            .get(`https://www.googleapis.com/books/v1/volumes?q=${searchInput}`)
            .then((res) => {

              if (!res.ok) {
                throw new Error('BookAPI ERROR: Something went wrong.');
              };

              const bookData = res.items.map((book) => ({
                type: selectedWord,
                authors: book.volumeInfo.authors || ['No author to display'],
                title: book.volumeInfo.title,
                description: book.volumeInfo.description,
                image: book.volumeInfo.imageLinks?.thumbnail || ''
              }));

              setSearchResults(bookData);
            })
            .catch((err) => {
              console.log(err);
            });

          break;
        }
      }
    }
  },
};

module.exports = resolvers;

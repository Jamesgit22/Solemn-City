import { gql } from '@apollo/client';

export const GET_ME = gql`
query Query {
  me {
    _id
    email
    username
    userThreads
    savedThreads {
      _id
      author {
        username
      }
      description
      likes
      timestamp
      title
    }
    reviews {
      _id
      date
      likes
      rating
      text
      timestamp
      title
    }
  }
}`

// export const GET_ME = gql`
// query Query {
//   me {
//     _id
//     email
//     username
//   }
// }`
    


export const USER_THREADS = gql`
query Query {
  userThreads {
    _id
    timestamp
    title
    likes
  }
}`

export const SINGLE_THREAD = gql`
query Query($threadId: ID!) {
  singleThread(threadId: $threadId) {
    _id
    timestamp
    title
    author {
      _id
      username
    }
    likes
    reviews {
      _id
      timestamp
      title
      text
      rating
      likes
      description
    }
    coms {
      author {
        _id
        username
      }
    }
  }
}`

export const REVIEWS = gql`
query Query {
  reviews {
    _id
    author {
      _id
    }
    timestamp
    type
    title
    text
    rating
    likes
  }
}`

export const SINGLE_REVIEW = gql`
query SingleReview($reviewId: ID!) {
  singleReview(reviewId: $reviewId) {
    _id
    author {
      _id
    }
    timestamp
    type
    title
    text
    rating
    likes
    date
    coms {
      author {
        _id
        username
      }
      timestamp
      text
      likes
    }
  }
}`

export const REVIEW_COMS = gql`
query ReviewComs($reviewId: ID!) {
  reviewComs(reviewId: $reviewId) {
    author {
      _id
      username
    }
    text
    timestamp
    likes
  }
}`

export const THREAD_COMS = gql`
query ThreadComs($threadId: ID!) {
  threadComs(threadId: $threadId) {
    author {
      _id
      username
    }
    text
    timestamp
    likes
  }
}`


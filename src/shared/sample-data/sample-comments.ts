import { CommentProps } from "../components/ui/comment-section";

export const sampleComments: CommentProps[] = [
  {
    id: "1",
    user: {
      id: "user1",
      name: "John Doe",
      username: "johndoe",
      avatar: "/assets/images/sample-avatar.jpeg",
    },
    content: "This is an amazing post! I love the content you've shared.",
    createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    likes: 12,
    isLiked: true,
    replies: [
      {
        id: "2",
        user: {
          id: "user2",
          name: "Jane Smith",
          username: "janesmith",
          avatar: "/assets/images/sample-avatar.jpeg",
        },
        content: "I agree! The information is very helpful.",
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        likes: 3,
        isLiked: false,
      },
    ],
  },
  {
    id: "3",
    user: {
      id: "user3",
      name: "Alex Johnson",
      username: "alexj",
      avatar: "/assets/images/sample-avatar.jpeg",
    },
    content: "Have you considered adding more examples to the tutorial? It would be great to see more use cases.",
    createdAt: new Date(Date.now() - 3600000 * 5), // 5 hours ago
    likes: 7,
    isLiked: false,
    replies: [
      {
        id: "4",
        user: {
          id: "user1",
          name: "John Doe",
          username: "johndoe",
          avatar: "/assets/images/sample-avatar.jpeg",
        },
        content: "That's a good suggestion! I'll consider adding more examples in my next update.",
        createdAt: new Date(Date.now() - 3600000 * 4), // 4 hours ago
        likes: 5,
        isLiked: true,
      },
      {
        id: "5",
        user: {
          id: "user4",
          name: "Sarah Wilson",
          username: "sarahw",
          avatar: "/assets/images/sample-avatar.jpeg",
        },
        content: "I would find additional examples very helpful too!",
        createdAt: new Date(Date.now() - 3600000 * 3), // 3 hours ago
        likes: 2,
        isLiked: false,
      },
    ],
  },
  {
    id: "6",
    user: {
      id: "user5",
      name: "Michael Brown",
      username: "michaelb",
      avatar: "/assets/images/sample-avatar.jpeg",
    },
    content: "I'm new to this topic. Is there a beginner's guide you could recommend?",
    createdAt: new Date(Date.now() - 3600000 * 10), // 10 hours ago
    likes: 4,
    isLiked: false,
    replies: [],
  },
];

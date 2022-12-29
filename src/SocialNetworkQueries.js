export class SocialNetworkQueries {
  constructor({ fetchCurrentUser }) {
    this.fetchCurrentUser = fetchCurrentUser;
  }

  async findPotentialLikes({ minimalScore } = {}) {
    try {
      const user = await this.fetchCurrentUser();

      const books = [];

      if (!user.friends || user.friends.length === 0) return { books };

      const userBooks = user.likes.books;

      const friendsBooks = user.friends
        .map(({ likes: { books } }) => books)
        .flat(1);

      if (friendsBooks.length === 0) return { books };

      // friends -> 3
      // score   -> 0.67 * 100 = 67.66
      const score = minimalScore * 100; // 67.66

      const totalFriends = user.friends.length;

      // the book score will be amount of a book in friend's list / total friend's
      // a book will be a potential book if his score > minimalScore

      const booksCounter = {};

      friendsBooks.forEach(bookTitle => {
        if (!booksCounter[bookTitle]) {
          booksCounter[bookTitle] = 1;
        } else {
          booksCounter[bookTitle] = booksCounter[bookTitle] += 1;
        }
      });

      const potentialBooks = [];

      Object.entries(booksCounter).filter(([bookTitle, count]) => {
        const potentialScore = (count / totalFriends) * 100;

        if (potentialScore > score && !userBooks.includes(bookTitle)) {
          potentialBooks.push({ bookTitle, count });
        }
      });

      const orderedPotentialBooks = potentialBooks
        .sort((firstBook, secondBook) => {
          // if firstBook.count > secondBook.count = return -1
          // so the firstBook will stay before secondBook
          if (firstBook.count > secondBook.count) return -1;

          // if firstBook.count < secondBook.count = return  1
          // so the firstBook will be after secondBook
          if (firstBook.count < secondBook.count) return 1;

          if (firstBook.count === secondBook.count) {
            // if book's names are equal = do alphabetical order

            if (firstBook.bookTitle < secondBook.bookTitle) return -1;

            if (firstBook.bookTitle > secondBook.bookTitle) return 1;
          }
        })
        .map(({ bookTitle }) => bookTitle);

      return {
        books: orderedPotentialBooks,
      };
    } catch (error) {
      return { books: [] };
    }
  }
}

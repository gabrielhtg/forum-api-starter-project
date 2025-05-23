const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail'); // Import ReplyDetail
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate the get thread detail action correctly', async () => {
    const threadId = 'thread-123';

    // const mockComment = new CommentDetail(commmentDetailData);

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // Mocking the actual implementations with resolved promises
    mockThreadRepository.getThreadById = jest.fn()
      .mockResolvedValue({
        id: 'thread-123',
        title: 'A thread',
        body: 'A long thread',
        date: '2023-09-22T00:00:00.000Z',
        username: 'foobar',
      });
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockResolvedValue([{
        id: 'comment-123',
        username: 'johndoe',
        date: '2023-09-08T07:22:33.555Z',
        content: 'a comment',
        deleted_at: null,
      }]);

    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockResolvedValue([
        {
          id: 'reply-456',
          username: 'janedoe',
          date: '2023-09-08T08:00:00.000Z',
          content: 'a reply to the comment',
          deleted_at: null,
        },
      ]);

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail).toStrictEqual(new ThreadDetail({
      id: 'thread-123',
      title: 'A thread',
      body: 'A long thread',
      date: '2023-09-22T00:00:00.000Z',
      username: 'foobar',
      comments: [
        new CommentDetail({
          id: 'comment-123',
          username: 'johndoe',
          date: '2023-09-08T07:22:33.555Z',
          content: 'a comment',
          deleted_at: null,
          replies: [
            new ReplyDetail({
              id: 'reply-456',
              username: 'janedoe',
              date: '2023-09-08T08:00:00.000Z',
              content: 'a reply to the comment',
              deleted_at: null,
            }),
          ],
        }),
      ],
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-123');
  });

  it('should handle deleted comments and replies correctly', async () => {
    const threadId = 'thread-123';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockResolvedValue({
        id: 'thread-123',
        title: 'A thread',
        body: 'A long thread',
        date: '2023-09-22T00:00:00.000Z',
        username: 'foobar',
      });
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockResolvedValue([{
        id: 'comment-123',
        username: 'johndoe',
        date: '2023-09-08T07:22:33.555Z',
        content: 'a comment',
        deleted_at: '2023-09-08T08:00:00.000Z',
      }]);

    // Mocking deleted reply
    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockResolvedValue([
        {
          id: 'reply-456',
          username: 'janedoe',
          date: '2023-09-08T08:00:00.000Z',
          content: 'a reply to the comment',
          deleted_at: '2023-09-08T09:00:00.000Z',
        },
      ]);

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail).toStrictEqual(new ThreadDetail({
      id: 'thread-123',
      title: 'A thread',
      body: 'A long thread',
      date: '2023-09-22T00:00:00.000Z',
      username: 'foobar',
      comments: [
        new CommentDetail({
          id: 'comment-123',
          username: 'johndoe',
          date: '2023-09-08T07:22:33.555Z',
          deleted_at: '2023-09-08T08:00:00.000Z',
          content: '**komentar telah dihapus**',
          replies: [],
        }),
      ],
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
  });

  it('test deleted reply', async () => {
    const threadId = 'thread-123';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockResolvedValue({
        id: 'thread-123',
        title: 'A thread',
        body: 'A long thread',
        date: '2023-09-22T00:00:00.000Z',
        username: 'foobar',
      }); // Return resolved Promise with ThreadDetail
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockResolvedValue([{
        id: 'comment-123',
        username: 'johndoe',
        date: '2023-09-08T07:22:33.555Z',
        content: 'a comment',
        deleted_at: null,
      }]); // Return resolved Promise with deleted comment

    // Mocking deleted reply
    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockResolvedValue([
        {
          id: 'reply-456',
          username: 'janedoe',
          date: '2023-09-08T08:00:00.000Z',
          content: 'a reply to the comment',
          deleted_at: '2023-09-08T09:00:00.000Z',
        },
      ]); // Return resolved Promise with deleted reply

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail).toStrictEqual(new ThreadDetail({
      id: 'thread-123',
      title: 'A thread wrong',
      body: 'A long thread',
      date: '2023-09-22T00:00:00.000Z',
      username: 'foobar',
      comments: [
        new CommentDetail({
          id: 'comment-123',
          username: 'johndoe',
          date: '2023-09-08T07:22:33.555Z',
          deleted_at: null,
          content: 'a comment',
          replies: [
            new ReplyDetail({
              id: 'reply-456',
              username: 'janedoe',
              date: '2023-09-08T08:00:00.000Z',
              content: '**balasan telah dihapus**',
              deleted_at: '2023-09-08T09:00:00.000Z',
            }),
          ],
        }),
      ],
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-123');
  });
});

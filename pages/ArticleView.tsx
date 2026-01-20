import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Loader2, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import { Article as ArticleType, Comment, User as UserType } from '../types';
import { db } from '../services/mockDb';

type Props = {
  currentUser: UserType | null;
};

const ArticleView: React.FC<Props> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [author, setAuthor] = useState<UserType | null>(null);
  const [commentText, setCommentText] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    setUsers(db.getUsers());
    if (id) {
      const a = db.getArticleById(id);
      if (a) {
        setArticle(a);
        const u = db.getUserById(a.authorId);
        if (u) setAuthor(u);
      }
    }
  }, [id]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      if (id) db.deleteArticle(id);
      navigate('/');
    }
  };

  const handlePostComment = () => {
    if (!currentUser || !commentText.trim() || !article) return;
    const newComment: Comment = {
      id: `c${Date.now()}`,
      authorId: currentUser.id,
      text: commentText,
      createdAt: new Date().toISOString(),
    };
    const updatedArticle = db.addComment(article.id, newComment);
    if (updatedArticle) {
      setArticle(updatedArticle);
      setCommentText('');
    }
  };

  if (!article || !author) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-north-400" /></div>;

  const isOwner = currentUser?.id === article.authorId;
  const getCommentAuthor = (authorId: string) => users.find((u) => u.id === authorId);

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center text-north-500 hover:text-north-800 mb-8 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Back to Feed
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-north-900 mb-6 leading-tight">{article.title}</h1>
        <div className="flex items-center justify-between border-b border-north-200 pb-6">
          <Link to={`/profile/${author.id}`} className="flex items-center gap-3 group">
            <img
              src={author.avatarUrl}
              alt={author.fullName}
              className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-north-200 transition-all"
            />
            <div>
              <p className="font-medium text-north-900 text-lg">{author.fullName}</p>
              <p className="text-sm text-north-500">{new Date(article.createdAt).toLocaleDateString()}</p>
            </div>
          </Link>
          {isOwner && (
            <div className="flex gap-2">
              <Link to={`/edit/${article.id}`}>
                <Button variant="secondary" className="px-3">
                  <Edit2 size={16} />
                </Button>
              </Link>
              <Button variant="danger" className="px-3" onClick={handleDelete}>
                <Trash2 size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-12 font-serif text-north-800 leading-relaxed text-lg">
        {article.blocks ? (
          <div className="space-y-6">
            {article.blocks.map((block) => {
              if (block.type === 'h1') return <h2 key={block.id} className="text-3xl font-bold text-north-900 mt-8 mb-4">{block.content}</h2>;
              if (block.type === 'h2') return <h3 key={block.id} className="text-2xl font-bold text-north-900 mt-6 mb-3">{block.content}</h3>;
              if (block.type === 'image') return <img key={block.id} src={block.content} alt="" className="w-full h-auto rounded-lg my-6" />;
              return <p key={block.id} className="whitespace-pre-wrap">{block.content}</p>;
            })}
          </div>
        ) : (
          <div className="prose prose-lg prose-slate max-w-none">
            {article.content.split('\n').map((line, i) => (
              <p key={i} className="mb-4">
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-12 border-b border-north-200 pb-8">
        {article.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>

      <div className="space-y-8">
        <h3 className="font-serif text-2xl font-bold text-north-900">Comments ({article.comments?.length || 0})</h3>

        {currentUser && (
          <div className="flex gap-4">
            <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-10 h-10 rounded-full object-cover shrink-0" />
            <div className="flex-1">
              <textarea
                className="w-full p-4 rounded-xl border border-north-200 focus:outline-none focus:ring-2 focus:ring-north-400 min-h-[100px] resize-none"
                placeholder="Add to the discussion..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <Button onClick={handlePostComment} disabled={!commentText.trim()}>
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {article.comments?.map((comment) => {
            const cAuthor = getCommentAuthor(comment.authorId);
            return (
              <div key={comment.id} className="flex gap-4">
                {cAuthor ? (
                  <Link to={`/profile/${cAuthor.id}`}>
                    <img src={cAuthor.avatarUrl} alt={cAuthor.fullName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  </Link>
                ) : (
                  <div className="w-10 h-10 bg-north-200 rounded-full shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-north-900">{cAuthor?.fullName || 'Unknown'}</span>
                    <span className="text-xs text-north-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-north-700">{comment.text}</p>
                </div>
              </div>
            );
          })}
          {(!article.comments || article.comments.length === 0) && (
            <p className="text-north-400 italic">No comments yet. Be the first to start the conversation.</p>
          )}
        </div>
      </div>
    </article>
  );
};

export default ArticleView;


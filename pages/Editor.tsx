import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heading, Heading2, Image as ImageIcon, Loader2, MoveDown, MoveUp, Sparkles, Trash2, Type } from 'lucide-react';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import { Article as ArticleType, ArticleBlock, BlockType, User as UserType } from '../types';
import { db } from '../services/mockDb';
import { generateTags } from '../services/geminiService';

type Props = {
  currentUser: UserType;
};

const Editor: React.FC<Props> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<ArticleBlock[]>([{ id: `b-${Date.now()}`, type: 'paragraph', content: '' }]);
  const [tags, setTags] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    if (id) {
      const existing = db.getArticleById(id);
      if (existing && existing.authorId === currentUser.id) {
        setTitle(existing.title);
        setTags(existing.tags);
        if (existing.blocks) {
          setBlocks(existing.blocks);
        } else {
          setBlocks([
            {
              id: 'legacy-1',
              type: 'paragraph',
              content: existing.content,
            },
          ]);
        }
      } else {
        navigate('/');
      }
    }
  }, [id, currentUser.id, navigate]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    const previewText =
      blocks
        .filter((b) => b.type === 'paragraph')
        .map((b) => b.content)
        .join(' ')
        .substring(0, 150) + '...';

    const article: ArticleType = {
      id: id || `a${Date.now()}`,
      authorId: currentUser.id,
      title,
      preview: previewText,
      content: 'See blocks',
      blocks: blocks,
      tags,
      createdAt: id ? db.getArticleById(id)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: id ? new Date().toISOString() : undefined,
      views: id ? db.getArticleById(id)?.views || 0 : 0,
      commentsCount: id ? db.getArticleById(id)?.commentsCount || 0 : 0,
      comments: id ? db.getArticleById(id)?.comments || [] : [],
    };

    db.saveArticle(article);
    navigate('/');
  };

  const handleAutoTag = async () => {
    setLoadingAI(true);
    const fullText = blocks.map((b) => b.content).join('\n');
    const newTags = await generateTags(fullText);
    setTags(newTags);
    setLoadingAI(false);
  };

  const addBlock = (type: BlockType) => {
    setBlocks([...blocks, { id: `b-${Date.now()}`, type, content: '' }]);
  };

  const updateBlock = (blockId: string, content: string) => {
    setBlocks(blocks.map((b) => (b.id === blockId ? { ...b, content } : b)));
  };

  const deleteBlock = (blockId: string) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter((b) => b.id !== blockId));
    }
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleImageUpload = (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        updateBlock(blockId, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      <div className="mb-6 flex justify-between items-center sticky top-[64px] z-30 bg-north-50/90 backdrop-blur py-4 border-b border-north-200/50">
        <h1 className="text-2xl font-serif font-bold text-north-900">{id ? 'Edit Article' : 'New Article'}</h1>
        <Button onClick={handleSave} className="shadow-lg">
          {id ? 'Update' : 'Publish'}
        </Button>
      </div>

      <div className="space-y-6">
        <input
          className="w-full text-4xl md:text-5xl font-serif font-bold placeholder-north-300 border-none focus:ring-0 bg-transparent px-0 mb-8"
          placeholder="Article Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div key={block.id} className="group relative pl-8 md:pl-12 transition-all">
              <div className="absolute left-0 top-1 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity">
                <button onClick={() => moveBlock(index, 'up')} className="p-1 text-north-400 hover:text-north-800">
                  <MoveUp size={14} />
                </button>
                <button onClick={() => moveBlock(index, 'down')} className="p-1 text-north-400 hover:text-north-800">
                  <MoveDown size={14} />
                </button>
                <button onClick={() => deleteBlock(block.id)} className="p-1 text-red-300 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>

              {block.type === 'h1' && (
                <input
                  className="w-full text-3xl font-bold font-serif bg-transparent border-none focus:ring-0 placeholder-north-200 px-0"
                  placeholder="Heading 1"
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, e.target.value)}
                  autoFocus
                />
              )}
              {block.type === 'h2' && (
                <input
                  className="w-full text-2xl font-bold font-serif bg-transparent border-none focus:ring-0 placeholder-north-200 px-0"
                  placeholder="Heading 2"
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, e.target.value)}
                  autoFocus
                />
              )}
              {block.type === 'paragraph' && (
                <textarea
                  className="w-full text-lg leading-relaxed bg-transparent border-none focus:ring-0 placeholder-north-200 px-0 resize-none overflow-hidden"
                  placeholder="Start writing..."
                  value={block.content}
                  onChange={(e) => {
                    updateBlock(block.id, e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  ref={(ref) => {
                    if (ref && !block.content) ref.focus();
                    if (ref) {
                      ref.style.height = 'auto';
                      ref.style.height = ref.scrollHeight + 'px';
                    }
                  }}
                />
              )}
              {block.type === 'image' && (
                <div className="border-2 border-dashed border-north-200 rounded-xl p-4 bg-north-50/50">
                  {block.content ? (
                    <div className="relative group/img">
                      <img src={block.content} alt="Upload" className="w-full h-auto rounded-lg max-h-[500px] object-contain" />
                      <button
                        onClick={() => updateBlock(block.id, '')}
                        className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-sm opacity-0 group-hover/img:opacity-100 transition-opacity text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <ImageIcon className="w-12 h-12 text-north-300 mb-2" />
                      <div className="flex gap-4 items-center">
                        <label className="cursor-pointer bg-white px-4 py-2 rounded-lg border border-north-200 hover:bg-north-50 text-sm font-medium shadow-sm transition-all">
                          Upload Image
                          <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(block.id, e)} />
                        </label>
                        <span className="text-north-300 text-sm">or paste URL</span>
                        <input
                          className="bg-transparent border-b border-north-300 focus:border-north-500 focus:outline-none text-sm w-48"
                          placeholder="https://..."
                          onBlur={(e) => updateBlock(block.id, e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <div className="flex gap-2 bg-white p-2 rounded-full shadow-lg border border-north-100">
            <button onClick={() => addBlock('paragraph')} className="p-2 hover:bg-north-50 rounded-full text-north-600 tooltip" title="Text">
              <Type size={20} />
            </button>
            <button onClick={() => addBlock('h1')} className="p-2 hover:bg-north-50 rounded-full text-north-600" title="Heading 1">
              <Heading size={20} />
            </button>
            <button onClick={() => addBlock('h2')} className="p-2 hover:bg-north-50 rounded-full text-north-600" title="Heading 2">
              <Heading2 size={20} />
            </button>
            <div className="w-px bg-north-200 mx-1"></div>
            <button onClick={() => addBlock('image')} className="p-2 hover:bg-north-50 rounded-full text-north-600" title="Image">
              <ImageIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-north-200">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-north-600">Tags</label>
          <button onClick={handleAutoTag} className="text-xs text-north-500 hover:text-north-800 flex items-center gap-1">
            {loadingAI ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            Auto-generate tags
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Tag key={tag} onRemove={() => setTags(tags.filter((t) => t !== tag))}>
              {tag}
            </Tag>
          ))}
          <input
            className="text-sm bg-transparent border-none focus:ring-0 placeholder-north-300 min-w-[100px]"
            placeholder="Add tag..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = e.currentTarget.value.trim();
                if (val && !tags.includes(val)) setTags([...tags, val]);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;


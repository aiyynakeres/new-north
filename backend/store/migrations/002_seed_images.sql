-- Point seeded and fallback media at the image assets shipped with the frontend.
-- Safe to run on every startup: only rows that still reference picsum are updated.

UPDATE users SET avatar_url = '/mocks/avatar-ayaan.jpg'
WHERE id = 'u1' AND avatar_url LIKE 'https://picsum.photos/%';

UPDATE users SET banner_url = '/mocks/cover-ayaan.jpg'
WHERE id = 'u1' AND banner_url LIKE 'https://picsum.photos/%';

UPDATE users SET avatar_url = '/mocks/avatar-lena.jpg'
WHERE id = 'u2' AND avatar_url LIKE 'https://picsum.photos/%';

UPDATE users SET banner_url = '/mocks/cover-lena.jpg'
WHERE id = 'u2' AND banner_url LIKE 'https://picsum.photos/%';

UPDATE communities SET cover_url = '/mocks/community-new-north.jpg'
WHERE id = 'c1' AND cover_url LIKE 'https://picsum.photos/%';

UPDATE communities SET cover_url = '/mocks/community-dev.jpg'
WHERE id = 'c2' AND cover_url LIKE 'https://picsum.photos/%';

UPDATE communities SET cover_url = '/mocks/community-stories.jpg'
WHERE id = 'c3' AND cover_url LIKE 'https://picsum.photos/%';

-- Images inside the seeded article blocks.
UPDATE articles
SET blocks = (
    SELECT jsonb_agg(
        CASE
            WHEN block->>'content' LIKE 'https://picsum.photos/%'
                THEN jsonb_set(block, '{content}', '"/mocks/community-new-north.jpg"')
            ELSE block
        END
    )
    FROM jsonb_array_elements(blocks) AS block
)
WHERE id = 'a1' AND blocks::text LIKE '%picsum.photos%';

-- Anything else created with the old placeholders.
UPDATE users SET avatar_url = '/mocks/avatar-placeholder.jpg'
WHERE avatar_url LIKE 'https://picsum.photos/%';

UPDATE users SET banner_url = '/mocks/cover-placeholder.jpg'
WHERE banner_url LIKE 'https://picsum.photos/%';

UPDATE communities SET cover_url = '/mocks/community-placeholder.jpg'
WHERE cover_url LIKE 'https://picsum.photos/%';

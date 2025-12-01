-- ============================================
-- INSERT DUMMY STORE DATA
-- Jalankan ini untuk membuat store & data dummy
-- Tidak perlu user auth!
-- ============================================

-- Insert store dengan ID yang digunakan di code
INSERT INTO stores (id, owner_id, name, slug, description)
VALUES (
    '22222222-2222-2222-2222-222222222222'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,  -- Dummy owner ID
    'Demo Store',
    'demo-store',
    'Store for development testing'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug;

SELECT 'Dummy store created! You can now access http://localhost:3000' as message;

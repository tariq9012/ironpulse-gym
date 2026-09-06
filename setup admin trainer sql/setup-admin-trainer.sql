-- ============================================================
-- IronPulse: Admin aur Trainer account banane ki SQL script
-- ============================================================
--
-- PEHLE YE KAREIN:
-- 1. Site pe (http://localhost:3000/sign-up) se normal signup karein
--    us email ke sath jise aap admin ya trainer banana chahte hain.
-- 2. Uske baad neeche wali query chala kar us user ki "userId" pata karein:
--
--    SELECT id, email, name FROM "user";
--
--    Jo "id" column me value milegi, wahi userId hai jo neeche
--    'REPLACE_WITH_USER_ID' ki jagah use karni hai.
--
-- Note: better-auth ki user table ka naam "user" hota hai (quotes ke sath
-- likhna zaroori hai kyunki "user" Postgres ka reserved keyword hai).


-- ============================================================
-- 1) ADMIN account banayein
-- ============================================================
INSERT INTO admins (user_id, display_name, active)
VALUES (
  'kJhOEiOabfYlqsl8W51P1Uo1srkSM3dU',   -- yahan admin wale user ki id daalein
  'Tariq',             -- admin ka naam jo dashboard me dikhega
  true
)
ON CONFLICT (user_id) DO NOTHING;


-- ============================================================
-- 2) TRAINER account banayein
-- ============================================================
INSERT INTO trainers (user_id, display_name, specialty, bio, active)
VALUES (
  'w9eLKr8WZdW3FdAgL3npB0xzBOBR4boE',        -- yahan trainer wale user ki id daalein
  'Tariq Jamil Khan',                -- trainer ka naam jo dashboard me dikhega
  'Strength & Conditioning',     -- trainer ki specialty (optional)
  'Great trainer with 3 years of experience', -- trainer ki bio (optional)
  true
)
ON CONFLICT (user_id) DO NOTHING;


-- ============================================================
-- (Optional) Agar ek se zyada admin/trainer banane hain,
-- upar wale INSERT block ko copy karke userId aur naam badal dein.
-- ============================================================

-- Verify karne ke liye:
-- SELECT * FROM admins;
-- SELECT * FROM trainers;

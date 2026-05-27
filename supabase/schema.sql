-- ============================================================================
-- NEOGAMMON DATABASE SCHEMA — SUPABASE / POSTGRESQL
-- ============================================================================

-- ENUMS
CREATE TYPE user_role AS ENUM ('player', 'trainer', 'admin');
CREATE TYPE game_mode AS ENUM ('blitz', 'bullet', 'rapid', 'ai', 'friend', 'trainer');
CREATE TYPE game_result AS ENUM ('win', 'loss', 'draw', 'resign');
CREATE TYPE difficulty_level AS ENUM ('1', '2', '3', '4', '5');
CREATE TYPE notification_type AS ENUM ('friend_request', 'party_invite', 'mission_complete', 'system_alert', 'tournament');
CREATE TYPE skill_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master');
CREATE TYPE lesson_category AS ENUM ('beginner', 'intermediate', 'master');

-- USER PROFILES
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  country_code CHAR(2) DEFAULT 'KZ',
  region VARCHAR(50),
  role user_role DEFAULT 'player',
  skill_tier skill_tier DEFAULT 'bronze',
  elo_rating INT DEFAULT 1000,
  regional_rank INT,
  total_matches INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ,
  is_online BOOLEAN DEFAULT FALSE,
  elo_blitz INT DEFAULT 1000,
  elo_bullet INT DEFAULT 1000,
  elo_rapid INT DEFAULT 1000,
  elo_puzzles INT DEFAULT 1000,
  win_rate DECIMAL(5,2) DEFAULT 0,
  avg_pip_count DECIMAL(6,2) DEFAULT 0,
  luck_skill_index DECIMAL(5,2) DEFAULT 0,
  blot_safety_coef DECIMAL(5,2) DEFAULT 0,
  CONSTRAINT valid_username CHECK (username ~ '^[a-zA-Z0-9_]+$'),
  CONSTRAINT valid_elo CHECK (elo_rating >= 0 AND elo_rating <= 3000)
);

CREATE INDEX idx_profiles_elo ON profiles(elo_rating DESC);
CREATE INDEX idx_profiles_regional ON profiles(region, elo_rating DESC);
CREATE INDEX idx_profiles_online ON profiles(is_online) WHERE is_online = TRUE;

-- GAME MATCHES
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  black_player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mode game_mode NOT NULL,
  difficulty difficulty_level,
  tournament_id UUID,
  initial_board_state JSONB NOT NULL,
  current_board_state JSONB NOT NULL,
  dice_roll INT[2],
  active_player_id UUID REFERENCES profiles(id),
  winner_id UUID REFERENCES profiles(id),
  result game_result,
  white_score INT DEFAULT 0,
  black_score INT DEFAULT 0,
  gammon BOOLEAN DEFAULT FALSE,
  backgammon BOOLEAN DEFAULT FALSE,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_seconds INT,
  elo_change_white INT,
  elo_change_black INT,
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

CREATE INDEX idx_matches_player ON matches(white_player_id, black_player_id);
CREATE INDEX idx_matches_active ON matches(status) WHERE status = 'in_progress';
CREATE INDEX idx_matches_date ON matches(start_time DESC);

-- TRANSACTIONAL MOVE LOGS
CREATE TABLE match_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  move_number INT NOT NULL,
  player_id UUID REFERENCES profiles(id),
  from_point INT NOT NULL,
  to_point INT NOT NULL,
  dice_used INT[2] NOT NULL,
  is_hit BOOLEAN DEFAULT FALSE,
  is_bearing_off BOOLEAN DEFAULT FALSE,
  engine_eval_score DECIMAL(6,4),
  is_optimal BOOLEAN,
  accuracy_percent DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, move_number)
);

CREATE INDEX idx_match_moves_match ON match_moves(match_id, move_number);

-- PUZZLES & SCENARIOS
CREATE TABLE puzzles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  category lesson_category NOT NULL,
  difficulty_level INT CHECK (difficulty_level BETWEEN 1 AND 10),
  board_state JSONB NOT NULL,
  active_player BOOLEAN NOT NULL,
  correct_move_from_point INT NOT NULL,
  correct_move_to_point INT NOT NULL,
  alternative_moves JSONB,
  times_solved INT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  author_id UUID REFERENCES profiles(id)
);

CREATE INDEX idx_puzzles_category ON puzzles(category, difficulty_level);

-- LESSON PROGRESS
CREATE TABLE user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  puzzle_id UUID REFERENCES puzzles(id),
  status VARCHAR(20) DEFAULT 'locked' CHECK (status IN ('locked', 'in_progress', 'completed')),
  attempts INT DEFAULT 0,
  best_score INT,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, puzzle_id)
);

-- LEADERBOARD ENGINE
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season VARCHAR(50) NOT NULL,
  region VARCHAR(50) DEFAULT 'global',
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rank INT NOT NULL,
  elo_rating INT NOT NULL,
  matches_played INT DEFAULT 0,
  wins INT DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(season, region, player_id)
);

CREATE INDEX idx_leaderboards_rank ON leaderboards(season, region, rank);

-- NOTIFICATIONS HUB
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- SOCIAL ARCHITECTURE
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(user_id, friend_id)
);

-- MULTIPLAYER LOBBY SYSTEM
CREATE TABLE lobby_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) DEFAULT 'Public Lobby',
  max_players INT DEFAULT 4,
  current_players INT DEFAULT 1,
  is_private BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT FALSE,
  game_mode game_mode,
  difficulty difficulty_level,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE lobby_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID REFERENCES lobby_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_host BOOLEAN DEFAULT FALSE,
  is_ready BOOLEAN DEFAULT FALSE,
  is_muted BOOLEAN DEFAULT FALSE,
  is_voice_enabled BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lobby_id, user_id)
);

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_public_read ON profiles FOR SELECT USING (TRUE);
CREATE POLICY profiles_own_update ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY matches_player_read ON matches FOR SELECT USING (
  auth.uid() = white_player_id OR auth.uid() = black_player_id
);
CREATE POLICY notifications_own ON notifications FOR SELECT USING (auth.uid() = user_id);

-- DYNAMIC SCORE COMPILATION TRIGGER
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE profiles SET
      total_matches = total_matches + 1,
      total_wins = total_wins + CASE WHEN NEW.winner_id = id THEN 1 ELSE 0 END,
      elo_rating = elo_rating + CASE
        WHEN id = NEW.white_player_id THEN COALESCE(NEW.elo_change_white, 0)
        ELSE COALESCE(NEW.elo_change_black, 0)
      END
    WHERE id IN (NEW.white_player_id, NEW.black_player_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_match_stats
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(6) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  player1_id UUID,
  player2_id UUID,
  player1_name VARCHAR(50),
  player2_name VARCHAR(50),
  current_player VARCHAR(1) DEFAULT 'X' CHECK (current_player IN ('X', 'O')),
  board TEXT[] DEFAULT ARRAY['', '', '', '', '', '', '', '', ''],
  winner VARCHAR(10),
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished'))
);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Create policies for rooms
CREATE POLICY "Anyone can read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Players can update their rooms" ON rooms FOR UPDATE USING (
  auth.uid() = player1_id OR auth.uid() = player2_id OR auth.uid() IS NULL
);

-- Create function to generate room codes
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old rooms (optional)
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

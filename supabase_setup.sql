
            -- 1. Create Profiles Table (for kitchen state persistence)
            CREATE TABLE IF NOT EXISTS public.profiles (
                id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
                kitchen_state JSONB DEFAULT '{}'::jsonb,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );

            -- 2. Create Chats Table (to group recipes into sessions)
            CREATE TABLE IF NOT EXISTS public.chats (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
                title TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );

            -- 3. Create Recipes Table (for history persistence)
            CREATE TABLE IF NOT EXISTS public.recipes (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
                chat_id UUID REFERENCES public.chats ON DELETE CASCADE,
                title TEXT NOT NULL,
                description TEXT,
                ingredients JSONB DEFAULT '[]'::jsonb,
                instructions JSONB DEFAULT '[]'::jsonb,
                timer_minutes JSONB DEFAULT '[0,0,0]'::jsonb,
                image_url TEXT,
                prep_time TEXT,
                servings TEXT,
                difficulty TEXT,
                cuisine TEXT,
                meal_type TEXT,
                day TEXT,
                is_full BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );

            -- 4. Set up Row Level Security (RLS)
            -- Enable RLS on all tables
            ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

            -- 5. Create Policies for Profiles
            CREATE POLICY "Users can view their own profile" 
            ON public.profiles FOR SELECT USING (auth.uid() = id);

            CREATE POLICY "Users can update their own profile" 
            ON public.profiles FOR UPDATE USING (auth.uid() = id);

            CREATE POLICY "Users can insert their own profile" 
            ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

            -- 6. Create Policies for Chats
            CREATE POLICY "Users can view their own chats" 
            ON public.chats FOR SELECT USING (auth.uid() = user_id);

            CREATE POLICY "Users can insert their own chats" 
            ON public.chats FOR INSERT WITH CHECK (auth.uid() = user_id);

            CREATE POLICY "Users can delete their own chats" 
            ON public.chats FOR DELETE USING (auth.uid() = user_id);

            -- 7. Create Policies for Recipes
            CREATE POLICY "Users can view their own recipes" 
            ON public.recipes FOR SELECT USING (auth.uid() = user_id);

            CREATE POLICY "Users can insert their own recipes" 
            ON public.recipes FOR INSERT WITH CHECK (auth.uid() = user_id);

            CREATE POLICY "Users can update their own recipes"
            ON public.recipes FOR UPDATE USING (auth.uid() = user_id);

            CREATE POLICY "Users can delete their own recipes" 
            ON public.recipes FOR DELETE USING (auth.uid() = user_id);

            -- 6. Trigger for handling profile creation on signup (Optional but recommended)
            -- This ensures a profile exists as soon as a user signs up
            CREATE OR REPLACE FUNCTION public.handle_new_user()
            RETURNS trigger AS $$
            BEGIN
            INSERT INTO public.profiles (id)
            VALUES (new.id);
            RETURN new;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;

            CREATE OR REPLACE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

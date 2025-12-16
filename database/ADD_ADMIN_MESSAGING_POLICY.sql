-- Admin Messaging Policy
-- Allows admins to send messages to any user
-- Run this in Supabase SQL Editor

-- ============================================
-- ADMIN MESSAGING POLICIES
-- ============================================

-- Allow admins to view all messages (for property management)
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
CREATE POLICY "Admins can view all messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Allow admins to send messages to any user
DROP POLICY IF EXISTS "Admins can send messages" ON public.messages;
CREATE POLICY "Admins can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Allow admins to update any message (mark as read, etc.)
DROP POLICY IF EXISTS "Admins can update messages" ON public.messages;
CREATE POLICY "Admins can update messages"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

'use server';

import { createServerClient_ } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const role = formData.get('role') as 'student' | 'mentor';

  const supabase = await createServerClient_();

  // Sign up
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  // Create profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: fullName,
        role,
        avatar_url: null,
        bio: null,
      });

    if (profileError) {
      return { error: profileError.message };
    }
  }

  redirect('/dashboard');
}

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createServerClient_();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}

export async function updateProfileAction(
  userId: string,
  formData: FormData
) {
  const fullName = formData.get('fullName') as string;
  const bio = formData.get('bio') as string;

  const supabase = await createServerClient_();

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      bio,
    })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export type UserRecord = {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  age: number;
  phone: string;
  email: string;
  city: string;
  password: string;
  password_hash: string;
  gender: string;
  registration_goal: string;
  newsletter_consent: number;
  photo_uri: string | null;
};

export const genderOptions = ['Чоловіча', 'Жіноча', 'Інша'];
export const goalOptions = ['Особистий розвиток', 'Пошук роботи', 'Навчання', 'Інше'];

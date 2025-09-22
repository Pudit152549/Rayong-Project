import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    email: '',
    fullName: '',
    firstname: '',
    lastname: '',
    age: null as number | null,
    gender: '',
    isLoggedIn: false,
    errorMessage: '',
    // ----------------------------------------------------
  }),
  actions: {
    login(email: string, password: string) {
      console.log(`Attempting login with Email: ${email}`);
      if (email === 'pudit.hengsiri@gmail.com' && password === 'pudit152549') {
        this.email = email;
        this.fullName = 'Pudit Hengsiri';
        this.firstname = 'Pudit';
        this.lastname = 'Hengsiri';
        this.age = 19;
        this.gender = 'male';
        this.isLoggedIn = true;
        this.errorMessage = '';
        console.log(`Login successful for User: ${email}`);
      } else {
        this.fullName = '';
        this.firstname = '';
        this.lastname = '';
        this.age = null;
        this.gender = '';
        this.isLoggedIn = false;
        console.log(`Login failed for User: ${email}`);
      }
    },
    logout() {
      console.log(`Logging out user: ${this.email}`);
      this.email = '';
      this.fullName = '';
      this.firstname = '';
      this.lastname = '';
      this.age = null;
      this.gender = '';
      this.isLoggedIn = false;
      this.errorMessage = '';
    },
    updateProfile({ firstname, lastname, age, gender }: { firstname: string, lastname: string, age: number, gender: string }) {
      this.firstname = firstname;
      this.lastname = lastname;
      this.age = age;
      this.gender = gender;
      console.log(`Profile updated: ${firstname} ${lastname}, Age: ${age}, Gender: ${gender}`);
    }
  }
});

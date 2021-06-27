<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img :src="require('../assets/logo.svg')" class="my-3" contain height="200" />
      </v-col>

      <v-col class="mb-4">
        <h1>Sign up and start editing on your google sheet</h1>
        <v-btn color="primary" @click="handleClickSignIn" v-if="!isSignIn" :disabled="!isInit">
          <v-icon>mdi-pencil</v-icon>Sign in
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "Signin",

  data() {
    return {
      isInit: false,
      isSignIn: false,
    };
  },
  methods: {
    async handleClickSignIn() {
      try {

    // console.log(process.env.VUE_APP_GOOGLE_CLIENT_ID);
    // console.log(await this.$gAuth.signIn());
    const authCode = await this.$gAuth.getAuthCode()

        this.$router.push({
          name : 'home',  
          params : {
            // 'access_token' : this.$gAuth.GoogleAuth.currentUser.get().getAuthResponse().access_token
            'access_token' : authCode
            }
          });

        this.isSignIn = this.$gAuth.isAuthorized;
        
      } catch (error) {
        //on fail do something
        console.error(error);
      }
    },
  },
  mounted() {
    let that = this;
    const authCode = '';
    
    let checkGauthLoad = setInterval(() => {
      that.isInit = that.$gAuth.isInit;
      that.isSignIn = that.$gAuth.isAuthorized;
      if (that.isInit) clearInterval(checkGauthLoad);
      if (that.isSignIn) {
        this.$router.push({name : 'home',  params : {'access_token' : authCode}});
      }
    }, 1000);
  },
};
</script>

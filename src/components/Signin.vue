<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
          :src="require('../assets/logo.svg')"
          class="my-3"
          contain
          height="200"
        />
      </v-col>

      <v-col class="mb-4">
        <h1>Sign up and start editing on your google sheet</h1>
        <v-btn
          color="primary"
          @click="handleClickSignIn"
          v-if="!isSignIn"
          :disabled="!isInit"
        >
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
      authCode: "",
    };
  },
  methods: {
    async handleClickSignIn() {
      try {
        this.$gAuth.signIn().then((googleUser) => {
			this.isSignIn = this.$gAuth.isAuthorized;
        	this.authCode = this.$gAuth.GoogleAuth.currentUser.get().getAuthResponse().access_token;

			if(this.isSignIn){
				this.$router.push({
					name: "home",
					params: {
						// 'access_token' : this.$gAuth.GoogleAuth.currentUser.get().getAuthResponse().access_token
						'access_token': this.authCode,
					},
				});
			}
		});       

      } catch (error) {
        //on fail do something
        console.error(error);
      }
    },
  },
  mounted() {
    let that = this;

    let checkGauthLoad = setInterval(() => {
      that.isInit = that.$gAuth.isInit;
      that.isSignIn = that.$gAuth.isAuthorized;
      if (that.isInit) clearInterval(checkGauthLoad);
      if (that.isSignIn) {
        this.$router.push({
          name: "home",
          params: { access_token: this.authCode },
        });
      }
    }, 1000);
  },
};
</script>

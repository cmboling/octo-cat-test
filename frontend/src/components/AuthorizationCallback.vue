<template>
  <div id="spinner" uk-spinner="ratio: 3">
  </div>
</template>

<script>
export default {
  name: "AuthorizationCallback",
  computed: {
    code() {
      return this.$route.query.code;
    },
    hasCode() {
      return this.code !== undefined;
    },
    state() {
      return this.$route.query.state;
    },
    hasState() {
      return this.state !== undefined;
    },
  },
  mounted() {
    if (this.hasCode && this.hasState) {
      this.$http
        .get("http://localhost:5000/authenticate/" + this.$route.query.code)
        .then((response) => {
          console.log(response);
          if (response.data.token) {
            this.$store.dispatch("login", response.data.token);
            console.log("Redirecting back to:", this.$store.getters.returnUrl);
            this.$router.replace(this.$store.getters.returnUrl);
          } else {
            console.log("Error: ", response.data.error);
            this.$router.replace({
              path: "/login",
              query: { error: response.data.error },
            });
          }
        })
        .catch((error) => {
          console.log(error);
          this.$router.replace({ path: "/login", query: { error: error } });
        });
    } else {
      const error = "Failed to authenticate with GitHub.";
      this.$router.replace({ path: "/login", query: { error: error } });
    }
  },
};
</script>

<style scoped>
#spinner {
  margin: auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
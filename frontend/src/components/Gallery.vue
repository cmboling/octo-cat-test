<template>
  <div>
    <h1 class="uk-heading-divider">
      Welcome to <a :href="profileUrl" class="uk-link-text">{{ profile["name"] }}'s</a> Gallery
    </h1>
    <div class="uk-flex uk-flex-center">
      <div class="uk-card uk-card-default uk-card-body">
        <div class="uk-placeholder"></div>
      </div>
      <div class="uk-card uk-card-default uk-card-body uk-margin-left">
        <div class="uk-placeholder"></div>
      </div>
        <div class="uk-card uk-card-default uk-card-body uk-margin-left">
        <div class="uk-placeholder"></div>
      </div>
      <div class="uk-card uk-card-default uk-card-body uk-margin-left">
        <div class="uk-placeholder"></div>
      </div>
        <div class="uk-card uk-card-default uk-card-body uk-margin-left">
        <div class="uk-placeholder"></div>
      </div>
      <div class="uk-card uk-card-default uk-card-body uk-margin-left">
        <div class="uk-placeholder"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Gallery",
  computed: {
    profile() {
      console.log("Gallery: For profile", this.$store.getters.profile);
      return this.$store.getters.profile;
    },
    profileUrl() {
      return "https://github.com/" + this.profile["login"];
    },
  },
};
</script>

<style scoped>
</style>
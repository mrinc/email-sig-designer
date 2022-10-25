<script setup lang="ts">
import { ref, watch } from 'vue';
import { create } from 'handlebars';

const signatureTemplate = ref('');
const signatureRenderTheme = ref(true);
const signatureRender = ref('<div>MAGIX HERE</div>');

const hdnlebars = create();
const generateHtmlFromTemplate = () => {
  try {
    const parsedTemplate = JSON.parse(signatureTemplate.value);

    let variables = parsedTemplate.vars;
    let render = parsedTemplate.render;

    let compiled = hdnlebars.compile(render);
    signatureRender.value = compiled(variables);

    signatureTemplate.value = (JSON as any).stringify(parsedTemplate, ' ', 2);
  } catch (exc) {
    signatureRender.value = 'NOT VALID TEMPLATE';
  }

};
</script>

<template>
  <header>
    <h1>Simple Email Signature Designer</h1>
  </header>

  <main>
    <div>
      Add the template code here: <button @click="generateHtmlFromTemplate()">> UPDATE</button><br />
      <textarea style="width: 500px; height: 500px;" v-model="signatureTemplate"></textarea>
    </div>
    <div>
      See your design here: <span style="cursor: pointer;" @click="signatureRenderTheme = !signatureRenderTheme">{{
          signatureRenderTheme ? 'light' : 'dark'
      }} mode</span><br />
      <div
        :style="`width: 1000px; height: 400px; padding: 10px; overflow: scroll; background: ${ signatureRenderTheme ? 'rgb(242,242,242)' : '#222222' }`"
        v-html="signatureRender"></div>
    </div>
    <div>
      Rendered HTML for the signature:<br />
      <textarea style="width: 500px; height: 500px;" v-model="signatureRender" :readonly="true"></textarea>
    </div>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>

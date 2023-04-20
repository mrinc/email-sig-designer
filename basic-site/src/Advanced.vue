<script setup lang="ts">
import { ref, watch, type Ref, onMounted } from 'vue';
import { create } from 'handlebars';

const signatureTemplate = ref('');
const signatureRenderTheme = ref(true);
const signatureRender = ref('<div>MAGIX HERE</div>');

const destUrl = ref('');
const designTitle = ref('');

const fields = ref([]) as Ref<{
  name: string;
  type: string;
  show: boolean;
  value: Record<string, any>;
}[]>;

watch(fields, (val) => {
  window.localStorage.setItem('fields', JSON.stringify(fields.value));
}, {
  deep: true,
});
watch(designTitle, (val) => {
  window.localStorage.setItem('designTitle', designTitle.value);
});

const hdnlebars = create();
const generateHtmlFromTemplate = () => {
  destUrl.value = '';
  fields.value = [];
  try {
    const parsedTemplate = JSON.parse(signatureTemplate.value);

    window.localStorage.setItem('temp-data', signatureTemplate.value);

    let existingFieldsString = window.localStorage.getItem('fields');
    let existingFields = null;
    if (existingFieldsString) {
      existingFields = JSON.parse(existingFieldsString);
    }

    let variables = parsedTemplate.vars;
    let render = parsedTemplate.render;

    let compiled = hdnlebars.compile(render);
    signatureRender.value = compiled(variables);

    signatureTemplate.value = (JSON as any).stringify(parsedTemplate, ' ', 2);

    let varKeys = Object.keys(variables);

    for (let vkey of varKeys) {
      if (typeof variables[vkey] === 'string') {
        fields.value.push({
          name: vkey,
          type: 'text',
          show: existingFields ? existingFields.find((f: any) => f.name === vkey)?.show : false,
          value: {
            value: variables[vkey]
          },
        });
      } else if (typeof variables[vkey] === 'boolean') {
        fields.value.push({
          name: vkey,
          type: 'boolean',
          show: existingFields ? existingFields.find((f: any) => f.name === vkey)?.show : false,
          value: {
            value: variables[vkey]
          },
        });
      } else if (typeof variables[vkey] === 'object') {
        if (variables[vkey].url && variables[vkey].text) {
          // link
          if (variables[vkey].url.indexOf('http') === 0) {
            fields.value.push({
              name: vkey,
              type: 'url',
              show: existingFields ? existingFields.find((f: any) => f.name === vkey)?.show : false,
              value: {
                text: variables[vkey].text,
                url: variables[vkey].url,
              },
            });
          }
          else if (variables[vkey].url.indexOf('mailto:') === 0) {
            fields.value.push({
              name: vkey,
              type: 'email',
              show: existingFields ? existingFields.find((f: any) => f.name === vkey)?.show : false,
              value: {
                text: variables[vkey].text,
                url: variables[vkey].url,
              },
            });
          }
          else if (variables[vkey].url.indexOf('tel:') === 0) {
            fields.value.push({
              name: vkey,
              type: 'phone',
              show: existingFields ? existingFields.find((f: any) => f.name === vkey)?.show : false,
              value: {
                text: variables[vkey].text,
                url: variables[vkey].url,
              },
            });
          }
        }
      }
    }

    window.localStorage.setItem('fields', JSON.stringify(fields.value));
    destUrl.value = window.location.href + 'q';
  } catch (exc) {
    signatureRender.value = 'NOT VALID TEMPLATE';
  }
};

function download(filename: string, text: string) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

const triggerDownload = () => {
  download((designTitle.value ?? 'mysignature') + '.signaturedesigner', btoa(JSON.stringify({
    data: signatureTemplate.value,
    fields: fields.value
  })));
}

onMounted(() => {
  designTitle.value = window.localStorage.getItem('designTitle') || 'mysignature';
  let tempData = window.localStorage.getItem('temp-data');
  if (tempData) {
    signatureTemplate.value = tempData;
    generateHtmlFromTemplate();
  }
})
</script>

<template>
  <header>
    <h1>Simple Email Signature Designer</h1>
  </header>

  <main>
    <div>
      Add the template code here: <button @click=" generateHtmlFromTemplate() ">> UPDATE</button><br />
      <textarea style="width: 500px; height: 500px;" v-model=" signatureTemplate "></textarea>
    </div>
    <div>
      See your design here: <span style="cursor: pointer;" @click=" signatureRenderTheme = !signatureRenderTheme ">{{
        signatureRenderTheme ? 'light' : 'dark'
      }} mode</span><br />
      <div
        :style=" `width: 1000px; height: 400px; padding: 10px; overflow: scroll; background: ${ signatureRenderTheme ? 'rgb(242,242,242)' : '#222222' }` "
        v-html=" signatureRender "></div>
    </div>
    <!-- <div>
      Rendered HTML for the signature:<br />
      <textarea style="width: 500px; height: 500px;" v-model="signatureRender" :readonly="true"></textarea>
    </div> -->
  </main>

  <div>
    Design config (check=show/hide):
    <div>
      <div v-for="     field      in      fields     " class="containeritem">
        <input type="checkbox" v-model=" field.show " class="appearance-none checked:bg-blue-500 mr-1" />
        <label>{{ field.name }}: </label>
        <template v-if=" field.type === 'text' ">
          <input type="text" v-model=" field.value.value " />
        </template>
        <template v-else-if=" field.type === 'boolean' ">
          <input type="checkbox" v-model=" field.value.value " class="appearance-none checked:bg-blue-500 mr-1" />
        </template>
        <template v-else-if=" field.type === 'email' ">
          <input type="email" v-model=" field.value.text " />
          <input type="text" v-model=" field.value.url " />
        </template>
        <template v-else-if=" field.type === 'phone' ">
          <input type="phone" v-model=" field.value.text " />
          <input type="text" v-model=" field.value.url " />
        </template>
        <template v-else-if=" field.type === 'url' ">
          <input type="text" v-model=" field.value.text " />
          <input type="url" v-model=" field.value.url " />
        </template>
      </div>
    </div>
    <div class="mt-4">
      <label>Name of design: </label>
      <input type="text" v-model=" designTitle " />
    </div>
    <div>
      <label>Url for person to go to: </label>
      <input type="url" readonly v-model=" destUrl " />
    </div>
    <div>
      <label>Export config for person: </label>
      <button @click=" triggerDownload() ">Download config</button>
    </div>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.containeritem {
  margin: 5px;
}

input {
  min-width: 10px;
  min-height: 10px;
  border: 1px solid #ccc;
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

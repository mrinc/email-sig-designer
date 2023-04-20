<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';
import { create } from 'handlebars';

const signatureTemplate = ref('');
const signatureRenderTheme = ref(true);
const signatureRender = ref('<div>MAGIX HERE</div>');

const fields = ref([]) as Ref<{
  name: string;
  type: string;
  show: boolean;
  value: Record<string, string | boolean | number>;
  uvalue: string | boolean | number | null;
}[]>;

watch(fields, (val) => {
  generateHtmlFromTemplate();
}, {
  deep: true,
});

const hdnlebars = create();
const generateHtmlFromTemplate = () => {
  try {
    const parsedTemplate = JSON.parse(signatureTemplate.value);

    let variables = parsedTemplate.vars;
    let render = parsedTemplate.render;

    for (let field of fields.value) {
      if (!field.show) continue;
      if (field.type === 'url' || field.type === 'email' || field.type === 'phone') {
        //console.log(JSON.stringify(field));
        //console.log(variables[field.name]);
        variables[field.name].text = field.value.text;

        if (field.type === 'email')
          variables[field.name].url = 'mailto:';
        else if (field.type === 'phone')
          variables[field.name].url = 'tel:';
        variables[field.name].url += field.uvalue ?? field.value.url;
      } else if (field.type === 'boolean')
        variables[field.name] = field.value.value;
      else if (field.type === 'text')
        variables[field.name] = field.value.value;
    }
    //console.log(variables);
    let compiled = hdnlebars.compile(render);
    signatureRender.value = compiled(variables);

    signatureTemplate.value = (JSON as any).stringify(parsedTemplate, ' ', 2);
  } catch (exc) {
    console.error(exc);
    signatureRender.value = 'NOT VALID TEMPLATE';
  }
};

const uploadFile = () => {
  const inputElement = document.getElementById("file-upload");
  if (inputElement === null) return alert('no file to upload');
  let elemFiles = (inputElement as any).files;
  if (elemFiles.length !== 1) return alert('no file to upload');
  let file = elemFiles[0];
  let callback = (data: {
    name: string,
    size: number,
    type: string,
    content: ArrayBuffer
  }) => {
    try {
      let decodedAS = (new TextDecoder().decode(data.content));
      let decodedAD = atob(decodedAS);
      let decoded = JSON.parse(decodedAD);
      signatureTemplate.value = decoded.data;
      fields.value = decoded.fields;
      for (let field of fields.value) {
        field.uvalue = null;
        if (field.type === 'boolean') {
          field.uvalue = (field.value.value as boolean);
        } else if (field.type === 'url') {
          field.uvalue = (field.value.url as string);
        } else if (field.type === 'email') {
          field.uvalue = (field.value.url as string).split('mailto:')[1];
        } else if (field.type === 'phone') {
          field.uvalue = (field.value.url as string).split('tel:')[1];
        } else
          field.uvalue = field.value.value;
      }
      //console.log(decoded.fields);
      //console.log(fields.value);
      generateHtmlFromTemplate();
    } catch (e) {
      alert('Invalid signature file');
    }
  }
  var reader = new FileReader();
  reader.onload = function (self: any) {
    if (self.target.readyState != 2) return;
    if (self.target.error) {
      alert('Error while reading file');
      return;
    }
    callback({
      name: file.name,
      size: file.size,
      type: file.type,
      content: self.target.result
    });
  };
  reader.readAsArrayBuffer(file);
}
</script>

<template>
  <header>
    <h1>Simple Email Signature Designer</h1>
  </header>

  <start>Upload the config file that was given to you:</start>
  <input type="file" id="file-upload" accept=".signaturedesigner" @change=" uploadFile() " />

  <main v-if=" signatureTemplate !== '' " style="text-align:left;">
    <div>
      <div>
        Design your signature
        <div>
          <div v-for="     field      in      fields     " class="containeritem">
            <template v-if=" field.show ">
              <label>{{ field.name }}: </label><br />
              <template v-if=" field.type === 'text' ">
                <input type="text" v-model=" field.value.value " />
              </template>
              <template v-else-if=" field.type === 'boolean' ">
                <input type="checkbox" v-model=" field.value.value " />
              </template>
              <template v-else-if=" field.type === 'email' ">
                <span>
                  text:
                  <input type="email" v-model=" field.value.text " />
                </span>
                <span>
                  action:
                  <input type="text" v-model=" field.uvalue " />
                </span>
              </template>
              <template v-else-if=" field.type === 'phone' ">
                <span>
                  text:
                  <input type="phone" v-model=" field.value.text " />
                </span>
                <span>
                  action:
                  <input type="text" v-model=" field.uvalue " />
                </span>
              </template>
              <template v-else-if=" field.type === 'url' ">
                <span>
                  text:
                  <input type="url" v-model=" field.value.text " />
                </span>
                <span>
                  action:
                  <input type="url" v-model=" field.uvalue " />
                </span>
              </template>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div>
      See your design here: <span style="cursor: pointer;" @click=" signatureRenderTheme = !signatureRenderTheme ">{{
        signatureRenderTheme ? 'light' : 'dark'
      }} mode</span><br />
      <div
        :style=" `width: 1000px; height: 400px; padding: 10px; overflow: scroll; background: ${ signatureRenderTheme ? 'rgb(242,242,242)' : '#222222' }` "
        v-html=" signatureRender "></div>
    </div>
  </main>
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

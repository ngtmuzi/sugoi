<template>
  <div class="row">
    <div class="col-sm-10">
      <pre :id="id">{{ JSON.stringify(content, null, 2) }}</pre>
    </div>
    <div class="col-sm-2">
      <button class="btn btn-success" @click="save()">保存</button>
    </div>
  </div>
</template>

<script>
  function override(target, source) {
    Object.keys(target).forEach(function (key) {
      if (!source.hasOwnProperty(key)) delete target[key];
    });
    Object.keys(source).forEach(function (key) {
      target[key] = source[key];
    });
    return target;
  }

  export default {
    data(){
      return {editor: null};
    },
    name   : 'editor',
    props  : {id: String, content: Object},
    methods: {
      save(){
        try {
          const obj = JSON.parse(this.editor.getValue());
          override(this.content, obj);
          this.$emit('change');
        } catch (err) {
          alert(err.message);
        }
      }
    },
    mounted(){
      this.editor = ace.edit(this.id);
      this.editor.setTheme("ace/theme/github");
      this.editor.session.setMode("ace/mode/json");
    },
    beforeDestroy(){
      this.editor.destroy();
    }
  }
</script>

<style>
  pre {
    min-height: 100px;
  }
</style>
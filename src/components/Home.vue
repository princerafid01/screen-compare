<template>
    <div>
        <v-app-bar light>
            <v-container>
                <v-row>
                    <v-col cols="12">
                        <v-toolbar-title color="indigo" class="float-left">G-Form</v-toolbar-title>
                        <v-btn  color="success" dark class="float-right" @click="signout">Switch to another Account</v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-app-bar>

    <div class="main">
        <v-container>
            <h1 class="float-left my-5">Form</h1>
            <v-dialog v-model="dialog" width="500">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn  color="blue lighten-2" dark v-bind="attrs" v-on="on" class="float-right mt-5">
                        Create
                    </v-btn>
                </template>

                <v-card>
                    <v-card-title class="headline grey lighten-2">
                        Create a New Sheet
                    </v-card-title>

                    <v-card-text>
                        <v-text-field label="Title"  hide-details="auto" v-model="newTitle"></v-text-field>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="createSheet"
                    >
                        Create
                    </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-container>
    </div>

    <div class="form mt-5">
        <v-container class="mt-5">
            <v-row class="mt-5">
                <v-col cols="12" class="mt-5">
                    <v-text-field class="mt-4" label="A unique Name" v-model="formData.name" hide-details="auto"></v-text-field>
                    <v-file-input class="mt-4" label="Upload Photo" v-model="formData.image" hide-details="auto"
                    truncate-length="15"
                    ></v-file-input>
                    <v-select :items="sheets" item-text="name" item-value="id" class="mt-4" label="Google Sheets" v-model="formData.sheet" @change="fetchFormHeader"></v-select>



                    <v-btn  color="success" dark class="mt-5" @click="addData">Add Data</v-btn>
                </v-col>
            </v-row>
        </v-container>


    </div>

    </div>
</template>

<script>
import axios from 'axios'
import nprogress from 'nprogress'
import Swal from 'sweetalert2'
    export default {
        data() {
            return {
                base_url : "https://sheets.googleapis.com/v4",
                sheets_url: "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'",
                sheets: null,
                dialog: false,
                newTitle: null,
                formData: {
                    name : null,
                    image: null
                },
                formHeader: {
                    col1 : null,
                    col2 : null,
                    col3 : null,
                },
                rules: [
                    TitleRules => !!TitleRules || 'Required.',
                    FormRules => !!FormRules || 'Required.',
                ],
            }
        },
        props: {
            access_token: {
                type: String,
            },
        },
        computed: {
            isSignin() {
                return this.$gAuth.isAuthorized
            },
            authCode(){
                return this.access_token != "" ? this.access_token : localStorage.getItem('authCode');
            }
        },
        watch: {
            isSignin(newValue) {
                if(!newValue) this.$router.push('/')
            }
        },
        methods: {
            signout() {
                this.$gAuth.signOut()
                localStorage.removeItem('authCode')
                this.$router.push('/')
            },
            fetchFormHeader(){
                nprogress.start();
                axios.get(`${this.base_url}/spreadsheets/${this.formData.sheet}/values/Sheet1!A1:C1`,{
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${this.authCode}`
                }
                })
                .then(({data}) => {
                    nprogress.done();
                    if(data.values)  [this.formHeader.col1, this.formHeader.col2 , this.formHeader.col3 ] =  data.values[0];
                });
            },
            createSheet(){
                nprogress.start()
                this.dialog = false
                axios.post(`${this.base_url}/spreadsheets`,{
                    "properties" : {
                        "title" : this.newTitle
                    }
                },{
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${this.authCode}`
                }
                })
                .then(() => {
                    nprogress.done()
                    Swal.fire(
                        'Created!',
                        'You have a created a sheet!',
                        'success'
                    )
                    this.loadSheet()
                    this.newTitle = null
                })
                .catch(() => {
                    nprogress.done()
                })
            },
            loadSheet(){
                axios.get(this.sheets_url , {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${this.authCode}`
                    }
                })
                .then(({data}) => {
                    this.sheets = data.files
                    this.resetData();
                });
            },
            async addData(){
                nprogress.start()
                console.log(this.formData.image);

                var metadata = {
                    name: this.formData.image.name,
                    mimeType: this.formData.image.type,
                    role: 'reader', type: 'anyone'
                    //parents: ["folderID"]
                };

                var permission = {
                    role: 'reader', type: 'anyone'
                };

                var formData = new FormData();
                formData.append( "metadata", new Blob( [JSON.stringify( metadata )], {type: "application/json"} ));
                formData.append( "file", this.formData.image );
                formData.append( "role", 'reader' );
                formData.append( "type", 'anyone' );
                

                fetch( "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=webViewLink", {
                    method: "POST",
                    headers: new Headers({ "Authorization": "Bearer " + this.authCode }),
                    body: formData,
                    }).then( function( response ){
                        console.log(response)
                    return response.json();
                    }).then( function( value ){
                    console.log( value );
                });


                // await axios.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{
                //     // mimeType : "image/jpeg",
                //     // name: "Workspace",
                //     body: formData
                // },{
                //     headers: {
                //         'Content-Type': '*/*',
                //         "Authorization": `Bearer ${this.authCode}`
                //     }
                // }).then((response) => console.log(response)).catch((err) => console.log(err));

                await axios.post(`${this.base_url}/spreadsheets/${this.formData.sheet}/values/A1:C1:append?valueInputOption=RAW`,{
                        "values": [
                            [ this.formData.name, this.formData.image]
                        ]
                },{
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${this.authCode}`
                    }
                })
                .then(() => {
                    nprogress.done()
                    Swal.fire(
                        'Successfull!',
                        'You have a inserted data on this sheet!',
                        'success'
                    );
                    this.resetData();
                })
                .catch(() => nprogress.done() )

            },
            resetData(){
                this.formData.name = null
                this.formData.profession = null
                this.formData.mobile = null
                this.formData.sheet = null
                this.formHeader.col1 = null
                this.formHeader.col2 = null
                this.formHeader.col3 = null
            }
        },
        mounted () {
            if(!this.$gAuth.isAuthorized) this.$router.push('/')
            this.loadSheet();
        },
    }
</script>

<style lang="scss" scoped>

</style>
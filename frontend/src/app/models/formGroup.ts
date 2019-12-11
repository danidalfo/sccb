export class FormGroup {

    constructor( _id = '', text = '') {
        this._id = _id;
        this.text = text;
    }

    _id: string;
    text: string;
}

export class ConstructorVectorError extends Error {
    constructor(message: string = 'Vector could not be constructed') {
        super(message);
        Object.setPrototypeOf(this, ConstructorVectorError.prototype);
    }
}

export class MissingComponentVectorError extends Error {
    constructor(message: string = 'Vector does not have this component') {
        super(message);
        Object.setPrototypeOf(this, MissingComponentVectorError.prototype);
    }
}

export class DimensionsVectorError extends Error {
    constructor(message: string = 'Vector does not have the right dimensions') {
        super(message);
        Object.setPrototypeOf(this, DimensionsVectorError.prototype);
    }
}

export class NoLengthVectorError extends Error {
    constructor(message: string = 'Vector does not have a length') {
        super(message);
        Object.setPrototypeOf(this, NoLengthVectorError.prototype);
    }
}

export class IncompatibilityVectorError extends Error {
    constructor(message: string = 'Vectors are not compatible for this operation') {
        super(message);
        Object.setPrototypeOf(this, NoLengthVectorError.prototype);
    }
}
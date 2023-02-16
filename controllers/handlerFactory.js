const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No tour found with that id', 404));
    }
    res.status(204).json({
      status: 'sucess',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No doc found with that id', 404));
    }
    res.status(200).json({
      status: 'sucess',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        doc: newDoc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // const tour = await Tour.findById(req.params.id);

    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    // populate guides field when querying

    // When using populate for large application, the performance might
    // go low as mongoose needs to make a new query for getting the users
    // in place of ObjectIds, so keep this in mind.
    // But for small application, it is ok to use this.

    // Tour.findOne({ _id: req.params.id })

    if (!doc) {
      return next(new AppError('No doc found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow nested GET reviews on tours
    let filter = {};
    if (req.params.tourid) filter = { tour: req.params.id };

    // EXECUTE QUERY
    let features = new APIFeatures(Model.find(filter), req.query);
    // console.log(features.queryString);
    features = features.filter().sort().limitFields().paginate();

    // const docs = await features.query.explain();
    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        docs: docs,
      },
    });
  });

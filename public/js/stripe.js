/* eslint-disable */
const bookTour = async (tourId) => {
  try {
    // Get checkout session from api
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    if (session.data.status === 'success') {
      window.setTimeout(() => {
        location.assign(session.data.session.url);
      }, 0);
    }
    // create checkout form + charge the credit card
  } catch (err) {
    // console.log(err);
    alert(err.message);
  }
};

const bookBtn = document.getElementById('book-tour');

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}


<script>
  
  import Slider from "../slider/+page.svelte";
</script>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<div class="font-body text-base leading-relaxed text-gray-800">
  <header class="bg-gray-800 text-white shadow-lg">
    <div class="container mx-auto px-4 py-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <i class="fas fa-regular fa-spa text-teal-300"></i>
          <h1 class="text-2xl font-heading font-bold">Shiatsu</h1>
        </div>
        <nav class="hidden md:flex space-x-6">
          <a href="./home" class="hover:text-teal-300 transition">Startseite</a>
          <a href="./booking" class="hover:text-teal-300 transition">Buchungen</a>
          <a href="./about" class="hover:text-teal-300 transition">Impressum</a>
        </nav>
        <button class="md:hidden text-2xl">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>
  </header>


<section class="py-12 bg-gray-50">
    <Slider></Slider>
</section>

  <section class="py-12 bg-gray-50">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-heading text-center mb-12 text-gray-800">Über mich</h2>
      <div class="grid md:grid-cols-1 gap-8">
        <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-200">
          
          <p class="text-1xl">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.  

Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer</p>

      </div>
    </div>
  </section>



  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-heading text-center mb-12 text-gray-800">Meine Angebote</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-200">
          <div class="text-teal-600 text-4xl mb-4">
            <i class="fas fa-spa"></i>
          </div>
          <h3 class="text-xl font-heading mb-2 text-gray-800">Angebot1</h3>
          <p class="text-gray-600">Hier kann ein Text über das Angebot stehen.</p>
          <p class="mt-4 font-bold text-teal-700">$80</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-200">
          <div class="text-teal-600 text-4xl mb-4">
            <i class="fas fa-leaf"></i>
          </div>
          <h3 class="text-xl font-heading mb-2 text-gray-800">Angebot2</h3>
          <p class="text-gray-600">Hier kann ein Text über das Angebot stehen.</p>
          <p class="mt-4 font-bold text-teal-700">$80</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-200">
          <div class="text-teal-600 text-4xl mb-4">
            <i class="fas fa-water"></i>
          </div>
          <h3 class="text-xl font-heading mb-2 text-gray-800">Angebot3</h3>
          <p class="text-gray-600">Hier kann ein Text über das Angebot stehen.</p>
          <p class="mt-4 font-bold text-teal-700">$80</p>
        </div>
      </div>
    </div>
  </section>

  <footer class="bg-gray-800 text-white py-12">
    <!--<div class="container mx-auto px-4">
      <div class="grid md:grid-cols-4 gap-8">
        <div>
          <h4 class="text-xl font-heading font-bold mb-4">Zen Shiatsu</h4>
          <p class="text-gray-400">Restoring balance through traditional Japanese healing techniques.</p>
        </div>
        <div>
          <h4 class="text-lg font-heading font-semibold mb-4">Quick Links</h4>
          <ul class="space-y-2">
            <li><a href="#" class="text-gray-400 hover:text-white transition">Home</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition">Book Appointment</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition">Services</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition">About Us</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-heading font-semibold mb-4">Contact</h4>
          <ul class="space-y-2">
            <li class="flex items-center">
              <i class="fas fa-map-marker-alt mr-2 text-teal-400"></i>
              <span class="text-gray-400">123 Healing Way, Serenity City</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-phone mr-2 text-teal-400"></i>
              <span class="text-gray-400">(555) 123-4567</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-envelope mr-2 text-teal-400"></i>
              <span class="text-gray-400">contact@zenshiatsu.com</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-heading font-semibold mb-4">Follow Us</h4>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-400 hover:text-white transition text-xl">
              <i class="fab fa-facebook"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-white transition text-xl">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-white transition text-xl">
              <i class="fab fa-twitter"></i>
            </a>
          </div>
          <p class="mt-4 text-gray-400 text-sm">© 2023 Zen Shiatsu. All rights reserved.</p>
        </div>
      </div>
    </div>-->
  </footer>
</div>

<style>
	.flower{
		height: 30vh;
	}
  .backgroundBuchungAktiv {
    background-color: rgba(0, 0, 0, 0.4);
  }

  /* --- NEU: CSS für die Animationen --- */
  .fade-in-out {
    animation: fadeInOut 3s forwards; /* 3 Sekunden Dauer, bleibt am Ende sichtbar (oder würde verschwinden) */
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translateY(-20px);
    }
    10% {
      opacity: 1;
      transform: translateY(0);
    }
    90% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-20px);
    }
  }

  .slide-in-out {
    animation: slideInOut 3s forwards;
  }

  @keyframes slideInOut {
    0% {
      transform: translateX(100%);
    }
    10% {
      transform: translateX(0);
    }
    90% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(100%);
    }
  }
  .calendar-day:hover:not(.disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .time-slot:hover:not(.booked) {
    background-color: #2dd4bf; /* Tailwind teal-400 */
    color: white;
  }
  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
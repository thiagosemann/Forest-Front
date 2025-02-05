import { Component, OnInit } from '@angular/core';
import { AirbnbCalendarService } from '../../shared/service/Banco_de_Dados/calendarioAirBnb_service';

interface EventDate {
  year: number;
  month: number;
  day: number;
  isDate: boolean;
  timezone: string;
}

interface Event {
  summary: string;
  startDate: EventDate | Date;
  endDate: EventDate | Date;
  description: string | null;
  uid: string;
}

interface Apartment {
  apartmentName: string;
  events: Event[];
}

@Component({
  selector: 'app-calendario-airbnb',
  templateUrl: './calendario-airbnb.component.html',
  styleUrls: ['./calendario-airbnb.component.css']
})
export class CalendarioAirbnbComponent implements OnInit {
  calendarData: { data: Apartment[] } | null = null;
  allEvents: any[] = []; // Array para armazenar todos os eventos

  constructor(private airbnbCalendarService: AirbnbCalendarService) { }

  ngOnInit(): void {
    this.airbnbCalendarService.getAirbnbCalendar().subscribe(
      data => {
        this.calendarData = data;
        if (this.calendarData) {
          this.calendarData.data.forEach((apartment: Apartment) => {
            apartment.events.forEach((event: Event) => {
              // Garantir que startDate e endDate sejam objetos Date
              event.startDate = this.convertToDate(event.startDate);
              event.endDate = this.convertToDate(event.endDate);
              
              // Adicionar informações do evento no array allEvents
              this.allEvents.push({
                apartmentName: apartment.apartmentName,
                summary: event.summary,
                startDate: event.startDate,
                endDate: event.endDate,
                description: event.description || 'Sem descrição',
                reservationUrl: this.getReservationUrl(event) || 'Sem link de reserva'
              });
            });
          });
        }
        console.log(this.allEvents); // Verifique no console os eventos gerados
      },
      error => {
        console.error('Erro ao obter os eventos do calendário', error);
      }
    );
  }

  // Função para extrair o link de reserva da descrição
  getReservationUrl(event: Event): string | null {
    if (event.description) {
      const match = event.description.match(/https:\/\/www\.airbnb\.com\/hosting\/reservations\/details\/[A-Za-z0-9]+/);
      return match ? match[0] : null;
    }
    return null;
  }

  // Função para converter datas
  convertToDate(eventDate: EventDate | Date): Date {
    if (eventDate instanceof Date) {
      return eventDate;
    }
    // Se startDate ou endDate não for uma instância de Date, converta para uma data válida
    if (eventDate && eventDate.year && eventDate.month && eventDate.day) {
      return new Date(eventDate.year, eventDate.month - 1, eventDate.day);
    }
    return new Date(); // Retorna data atual se não for válida
  }
}

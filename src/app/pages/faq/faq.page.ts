import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';

interface FAQ {
  question: string;
  answer: string;
  expanded?: boolean;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
})
export class FaqPage implements OnInit {
  faqs: FAQ[] = [];
  searchTerm = '';
  filteredFaqs: FAQ[] = [];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.faqs = this.dataService.getFAQs().map(faq => ({
      ...faq,
      expanded: false
    }));
    this.filteredFaqs = [...this.faqs];
  }

  toggleFaq(index: number) {
    this.filteredFaqs[index].expanded = !this.filteredFaqs[index].expanded;
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value.toLowerCase();
    this.filterFaqs();
  }

  private filterFaqs() {
    if (!this.searchTerm) {
      this.filteredFaqs = [...this.faqs];
      return;
    }

    this.filteredFaqs = this.faqs.filter(faq =>
      faq.question.toLowerCase().includes(this.searchTerm) ||
      faq.answer.toLowerCase().includes(this.searchTerm)
    );
  }

  expandAll() {
    this.filteredFaqs.forEach(faq => faq.expanded = true);
  }

  collapseAll() {
    this.filteredFaqs.forEach(faq => faq.expanded = false);
  }

}

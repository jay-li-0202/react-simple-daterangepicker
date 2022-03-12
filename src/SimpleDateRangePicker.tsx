import { Button, Paper, TextField } from '@mui/material';
import { ChangeEventHandler, Component } from 'react';
import InputMask from "react-input-mask";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import React from 'react';
import { format } from 'date-fns';

export interface SimpleDateRangePickerProps {
    onChangeFrom: (date: Date | undefined) => void;
    onChangeTo: (date: Date | undefined) => void;
}

export interface SimpleDateRangePickerState {
    fromDate: Date | undefined;
    toDate: Date | undefined;
    fromDateValue: string;
    toDateValue: string;
    currentCalendarDate: Date;
    showCalendar: boolean;
    calendarRef: React.RefObject<any>;
}

export default class SimpleDateRangePicker extends Component<SimpleDateRangePickerProps, SimpleDateRangePickerState> {

    state: SimpleDateRangePickerState;

    constructor(props: SimpleDateRangePickerProps) {
        super(props);
        this.state = {
            fromDateValue: '',
            toDateValue: '',
            currentCalendarDate: new Date(), // start with today
            showCalendar: false,
            calendarRef: React.createRef(),
            fromDate: undefined,
            toDate: undefined
        };
    }

    componentDidMount() {
        document.addEventListener('mousedown', (e) => { this.handleOutsideClick(e) });
    }

    handleOutsideClick(e: MouseEvent): void {
        let clickedOutsideCalendar = this.state.calendarRef && !this.state.calendarRef.current.contains(e.target);

        this.setState({
            showCalendar: clickedOutsideCalendar ? false : !clickedOutsideCalendar ? true : !this.state.showCalendar
        });
    }

    onChangeFrom(e: React.ChangeEvent<HTMLInputElement>): void {
        const { onChangeFrom } = this.props;
        if (onChangeFrom) {
            onChangeFrom(new Date(e.target.value));
        }

        this.setState({
            fromDateValue: e.target.value
        });
    }

    onChangeTo(e: React.ChangeEvent<HTMLInputElement>): void {
        const { onChangeTo } = this.props;
        if (onChangeTo) {
            onChangeTo(new Date(e.target.value));
        }

        this.setState({
            toDateValue: e.target.value
        });
    }

    calendarNavigateBack(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        this.setState({
            currentCalendarDate: new Date(this.state.currentCalendarDate.setMonth(this.state.currentCalendarDate.getMonth() - 1))
        });
    }

    calendarNavigateNext(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        this.setState({
            currentCalendarDate: new Date(this.state.currentCalendarDate.setMonth(this.state.currentCalendarDate.getMonth() + 1))
        });
    }

    getCurrentCalendarDateDaysInMonth(): number {
        return new Date(this.state.currentCalendarDate.getFullYear(), this.state.currentCalendarDate.getMonth() + 1, 0).getDate();
    }

    dayClicked(e: React.MouseEvent<HTMLDivElement, MouseEvent>, day: number): void {

        let newDate = new Date(this.state.currentCalendarDate);
        newDate.setDate(day);

        // both dates are defined, check if we're extending the to date or setting the from date
        if (this.state.fromDate !== undefined && this.state.toDate !== undefined) {
            if (newDate > this.state.toDate) {
                this.setState({
                    toDate: newDate,
                    toDateValue: format(newDate, 'MM/dd/yyyy')
                });
                const { onChangeTo } = this.props;
                if (onChangeTo) {
                    onChangeTo(newDate);
                }
            }
            else {
                this.setState({
                    fromDate: newDate,
                    fromDateValue: format(newDate, 'MM/dd/yyyy'),
                    toDate: undefined,
                    toDateValue: ''
                });
                const { onChangeFrom } = this.props;
                if (onChangeFrom) {
                    onChangeFrom(newDate);
                }
                const { onChangeTo } = this.props;
                if (onChangeTo) {
                    onChangeTo(undefined);
                }
            }
        }
        else {

            // the from date isn't set, start with that
            if (this.state.fromDate === undefined) {
                this.setState({
                    fromDate: newDate,
                    fromDateValue: format(newDate, 'MM/dd/yyyy')
                });
                const { onChangeFrom } = this.props;
                if (onChangeFrom) {
                    onChangeFrom(newDate);
                }
            }
            else if (this.state.fromDate?.getDate() < day) {
                this.setState({
                    toDate: newDate,
                    toDateValue: format(newDate, 'MM/dd/yyyy')
                });
                const { onChangeTo } = this.props;
                if (onChangeTo) {
                    onChangeTo(newDate);
                }
            }
                // otherwise set the from date again
            else {
                this.setState({
                    fromDate: newDate,
                    fromDateValue: format(newDate, 'MM/dd/yyyy')
                });
                const { onChangeFrom } = this.props;
                if (onChangeFrom) {
                    onChangeFrom(newDate);
                }
            }
        }
    }

    render() {

        let daysInMonth = this.getCurrentCalendarDateDaysInMonth();

        let weeks : Array<number[]> = [];
        for (var i = 7; i < daysInMonth; i += 7) {

            let r = [];
            for (var j = i; j > i - 7; j--) {
                r.push(j);
            }

            weeks.push(r.reverse());
        }

        let lastWeek = weeks[weeks.length - 1];

        // get the remainder
        if (lastWeek[lastWeek.length - 1] !== daysInMonth) {
            let finalWeek = [];
            for (var i = lastWeek[lastWeek.length - 1] + 1; i <= daysInMonth; i++) {
                finalWeek.push(i);
            }

            weeks.push(finalWeek);
        }

        let weekDayNames = [
            'Su',
            'Mo',
            'Tu',
            'We',
            'Th',
            'Fr',
            'Sa'
        ];

        return (
            <div id="parentElement" ref={this.state.calendarRef} style={{width: '500px'}}>
                <InputMask mask="99/99/9999" onChange={(e) => this.onChangeFrom(e)} value={this.state.fromDateValue}>
                    {() => <TextField id="outlined-basic" label="From" variant="outlined" />}
                </InputMask>
                <InputMask mask="99/99/9999" onChange={(e) => this.onChangeTo(e)} value={this.state.toDateValue}>
                    {() => <TextField id="outlined-basic" label="To" variant="outlined" />}
                </InputMask>

                <Paper style={{ padding: '24px', width: '300px', textAlign: 'center', display: this.state.showCalendar ? 'block' : 'none' }}>
                    <div style={{float: 'left', width: '100%'}}>
                    <Button onClick={(e) => { this.calendarNavigateBack(e) }} style={{ float: 'left' }}>
                        <NavigateBeforeIcon />
                    </Button>
                        <span style={{fontWeight: '700'}}>{this.state.currentCalendarDate.toLocaleString('default', { month: 'long' })} {this.state.currentCalendarDate.toLocaleString('default', { year: 'numeric' })}</span>
                        <Button onClick={(e) => { this.calendarNavigateNext(e) }} style={{ float: 'right' }}>
                        <NavigateNextIcon />
                    </Button>
                    </div>
                    <div style={{ display: 'inline-block' }}>
                    {
                        weekDayNames.map(name => {
                            return (
                                <Paper sx={{borderColor: 'white'}} variant="outlined" style={{ display: 'inline-block', width: '36px', height: '36px', textAlign: 'center', color: '#999' }}>{name}</Paper>
                                );
                        })
                    }
                    </div>
                    <div style={{ display: 'inline-block' }}>
                    {
                        weeks.map(week => {
                            return (<div style={{ display: 'block', textAlign: 'left' }}>
                                {
                                    week.map(day => {
                                        let date = new Date(this.state.currentCalendarDate);
                                        date.setDate(day);
                                        let dateFormatted = date ? format(date, 'MM/dd/yyyy') : undefined;
                                        let fromDateFormatted = this.state.fromDate ? format(this.state.fromDate, 'MM/dd/yyyy') : undefined;
                                        let toDateFormatted = this.state.toDate ? format(this.state.toDate, 'MM/dd/yyyy') : undefined;

                                        return <Paper onClick={(e) => { this.dayClicked(e, day) }} variant="outlined" style={{
                                            backgroundColor: dateFormatted == fromDateFormatted || dateFormatted == toDateFormatted ? '#265b5f' :
                                                this.state.fromDate && this.state.toDate && date > this.state.fromDate && date < this.state.toDate ? '#1EA1A1' : '#fff',
                                            display: 'inline-block', width: '36px', height: '36px', textAlign: 'center'
                                        }}>{day}</Paper>
                                    })
                                }
                            </div>
                            )
                        })
                    }
                    </div>
                    <div style={{ display: 'block' }}>
                        <Button onClick={() => { this.setState({currentCalendarDate: new Date()})}}>
                            Today
                        </Button>
                    </div>
                </Paper>
            </div>
            );
    }
}